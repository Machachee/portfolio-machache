class TerminalResume {
  constructor() {
    this.output = document.getElementById("output");
    this.input = document.getElementById("command-input");
    this.terminal = document.querySelector(".terminal");
    this.terminalContainer = document.querySelector(".terminal-container");
    this.contextMenu = document.querySelector(".context-menu");
    this.terminals = [{ input: this.input, history: [], historyIndex: -1 }];
    this.activeTerminal = 0;
    this.activeTerminalContent = null;
    this.resizing = null;
    this.currentTheme = localStorage.getItem("theme") || "default";
    this.projects = [];
    this.skills = {};
    this.fileSystem = {};
    this.gameActive = false;
    this.gameHandler = null;
    this.themeModal = document.getElementById("theme-modal");
    this.projectsModal = document.getElementById("projects-modal");
    this.skillsModal = document.getElementById("skills-modal");
    this.themeToggle = document.getElementById("theme-toggle");

    this.setupEventListeners();
    this.loadProjects();
    this.loadSkills();
    this.setupFileSystem();
    this.init();
  }

  init() {
    this.handleThemeChange(this.currentTheme);
    document.querySelectorAll(".close-button").forEach((button) => {
      button.addEventListener("click", () => {
        this.closeModal(button.closest(".modal"));
      });
    });
    this.themeToggle.addEventListener("click", () => {
      this.showModal(this.themeModal);
    });
    document.querySelectorAll(".theme-option").forEach((option) => {
      option.addEventListener("click", () => {
        this.handleThemeChange(option.dataset.theme);
      });
    });

    this.setupWindowButtons();
    this.printWelcomeMessage();
    this.input.focus();
    this.setupContextMenu();
  }

  setupWindowButtons() {
    const closeBtn = this.terminal.querySelector(".terminal-buttons .close");
    const minimizeBtn = this.terminal.querySelector(".terminal-buttons .minimize");
    const maximizeBtn = this.terminal.querySelector(".terminal-buttons .maximize");
    const header = this.terminal.querySelector(".terminal-header");

    if (closeBtn) {
      closeBtn.setAttribute("role", "button");
      closeBtn.setAttribute("aria-label", "Close terminal");
      closeBtn.setAttribute("tabindex", "0");
      const close = (e) => {
        e.stopPropagation();
        this.terminal.classList.add("closing");
        setTimeout(() => {
          window.location.href = "/";
        }, 250);
      };
      closeBtn.addEventListener("click", close);
      closeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") close(e);
      });
    }

    if (maximizeBtn) {
      maximizeBtn.setAttribute("role", "button");
      maximizeBtn.setAttribute("aria-label", "Maximize terminal");
      maximizeBtn.setAttribute("tabindex", "0");
      const toggleMax = (e) => {
        e.stopPropagation();
        if (this.terminal.classList.contains("minimized")) {
          this.terminal.classList.remove("minimized");
        }
        this.terminal.classList.toggle("maximized");
        document.body.classList.toggle("terminal-maximized", this.terminal.classList.contains("maximized"));
      };
      maximizeBtn.addEventListener("click", toggleMax);
      maximizeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") toggleMax(e);
      });
      maximizeBtn.addEventListener("dblclick", toggleMax);
    }

    if (minimizeBtn) {
      minimizeBtn.setAttribute("role", "button");
      minimizeBtn.setAttribute("aria-label", "Minimize terminal");
      minimizeBtn.setAttribute("tabindex", "0");
      const minimize = (e) => {
        e.stopPropagation();
        if (this.terminal.classList.contains("maximized")) {
          this.terminal.classList.remove("maximized");
          document.body.classList.remove("terminal-maximized");
        }
        this.terminal.classList.add("minimized");
      };
      minimizeBtn.addEventListener("click", minimize);
      minimizeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") minimize(e);
      });
    }

    if (header) {
      header.addEventListener("dblclick", (e) => {
        if (e.target.closest(".terminal-buttons") || e.target.closest(".terminal-controls")) return;
        if (this.terminal.classList.contains("minimized")) {
          this.terminal.classList.remove("minimized");
          return;
        }
        this.terminal.classList.toggle("maximized");
        document.body.classList.toggle("terminal-maximized", this.terminal.classList.contains("maximized"));
      });
    }
    this.terminal.addEventListener("click", (e) => {
      if (this.terminal.classList.contains("minimized") && !e.target.closest(".terminal-buttons")) {
        this.terminal.classList.remove("minimized");
        const focusInput = this.terminals[this.activeTerminal]?.input;
        if (focusInput) focusInput.focus();
      }
    });
  }

  setupContextMenu() {
    this.terminalContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const terminalContent = e.target.closest(".terminal-content");
      if (terminalContent) {
        this.activeTerminalContent = terminalContent;
        this.showContextMenu(e.clientX, e.clientY);
      }
    });
    document.addEventListener("click", () => {
      this.contextMenu.classList.remove("active");
    });
    this.contextMenu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (action) {
        this.handleContextMenuAction(action);
      }
    });
  }

  showContextMenu(x, y) {
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.classList.add("active");
    const closeOption = this.contextMenu.querySelector(
      '[data-action="close-split"]'
    );
    const isMainTerminal =
      this.activeTerminalContent === this.terminalContainer.firstElementChild;
    closeOption.style.display = isMainTerminal ? "none" : "block";
  }

  handleContextMenuAction(action) {
    if (!this.activeTerminalContent) return;

    switch (action) {
      case "split-h":
        this.splitTerminal("horizontal", this.activeTerminalContent);
        break;
      case "split-v":
        this.splitTerminal("vertical", this.activeTerminalContent);
        break;
      case "close-split":
        this.closeSplit(this.activeTerminalContent);
        break;
    }
    this.contextMenu.classList.remove("active");
  }

  setupEventListeners() {
    this.terminalContainer.addEventListener("click", (e) => {
      const terminalContent = e.target.closest(".terminal-content");
      if (terminalContent) {
        const input = terminalContent.querySelector("input");
        if (input) {
          input.focus();
          this.activeTerminal = this.terminals.findIndex(
            (t) => t.input === input
          );
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        const activeContent =
          this.terminals[this.activeTerminal].input.closest(
            ".terminal-content"
          );
        if (activeContent) {
          this.splitTerminal("horizontal", activeContent);
        }
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        const activeContent =
          this.terminals[this.activeTerminal].input.closest(
            ".terminal-content"
          );
        if (activeContent) {
          this.splitTerminal("vertical", activeContent);
        }
      }
    });
    this.setupInputHandlers(this.input);
  }

  setupInputHandlers(inputElement) {
    inputElement.addEventListener("keydown", (e) => {
      const terminal = this.terminals.find((t) => t.input === inputElement);
      if (!terminal) return;

      if (e.key === "Enter") {
        this.handleCommand(inputElement);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory("up", terminal);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory("down", terminal);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        const outputElement = inputElement
          .closest(".terminal-content")
          .querySelector("[id^='output']");
        outputElement.innerHTML = "";
        this.printWelcomeMessage(outputElement);
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.handleTabCompletion(inputElement);
      }
    });
  }

  handleTabCompletion(inputElement) {
    const currentInput = inputElement.value.toLowerCase().trim();
    const commands = [
      "help",
      "about",
      "skills",
      "experience",
      "education",
      "contact",
      "social",
      "clear",
      "projects",
      "skills-visual",
      "game",
      "exit-game",
      "matrix",
      "stop-matrix",
      "calc",
      "calculate",
      "pdf",
      "cv",
      "linkedin-cover",
      "whoami",
      "pwd",
      "ls",
      "cat",
      "date",
      "echo",
      "history",
      "open",
    ];
    const matches = commands.filter((cmd) => cmd.startsWith(currentInput));

    if (matches.length === 1) {
      inputElement.value = matches[0];
    } else if (matches.length > 1 && currentInput) {
      const outputElement = inputElement
        .closest(".terminal-content")
        .querySelector("[id^='output']");

      const matchesText = `\nPossible commands:\n${matches.join("  ")}`;
      this.printToOutput(outputElement, matchesText, "info");
    }
  }

  navigateHistory(direction, terminal) {
    if (
      direction === "up" &&
      terminal.historyIndex < terminal.history.length - 1
    ) {
      terminal.historyIndex++;
    } else if (direction === "down" && terminal.historyIndex > -1) {
      terminal.historyIndex--;
    }

    if (
      terminal.historyIndex >= 0 &&
      terminal.historyIndex < terminal.history.length
    ) {
      terminal.input.value =
        terminal.history[terminal.history.length - 1 - terminal.historyIndex];
    } else {
      terminal.input.value = "";
    }
  }

  splitTerminal(direction, sourceTerminal) {
    const parentContainer = sourceTerminal.parentElement;
    const isAlreadySplit = parentContainer.children.length > 1;
    const splitClass = direction === "horizontal" ? "split-h" : "split-v";

    // If parent is not split or split in different direction, create new container
    if (!isAlreadySplit || !parentContainer.classList.contains(splitClass)) {
      const newContainer = document.createElement("div");
      newContainer.className = `terminal-container ${splitClass}`;
      sourceTerminal.parentElement.insertBefore(newContainer, sourceTerminal);
      newContainer.appendChild(sourceTerminal);
      this.createNewTerminalContent(newContainer);
    } else {
      this.createNewTerminalContent(parentContainer);
    }
  }

  createNewTerminalContent(container) {
    const newContent = document.createElement("div");
    newContent.className = "terminal-content";
    const timestamp = Date.now();
    newContent.innerHTML = `
      <div id="output-${timestamp}" class="terminal-output"></div>
      <div class="input-line">
        <span class="prompt">➜</span>
        <input type="text" id="command-input-${timestamp}" class="command-input" />
      </div>
    `;
    if (container.children.length > 0) {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${
        container.classList.contains("split-h") ? "horizontal" : "vertical"
      }`;
      container.lastElementChild.appendChild(handle);
      this.setupResizeHandle(handle);
    }

    container.appendChild(newContent);
    const newInput = newContent.querySelector(".command-input");
    this.setupInputHandlers(newInput);
    this.terminals.push({
      input: newInput,
      history: [],
      historyIndex: -1,
    });
    const newOutput = newContent.querySelector(`#output-${timestamp}`);
    this.printWelcomeMessage(newOutput);
    newInput.focus();
    this.activeTerminal = this.terminals.length - 1;
  }

  setupResizeHandle(handle) {
    const isHorizontal = handle.classList.contains("horizontal");

    const startResize = (e) => {
      e.preventDefault();
      this.resizing = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        parentContainer: handle.closest(".terminal-container"),
        element: handle.parentElement,
        initialSize: isHorizontal
          ? handle.parentElement.offsetWidth
          : handle.parentElement.offsetHeight,
      };

      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
    };

    const resize = (e) => {
      if (!this.resizing) return;

      const { parentContainer, element, startX, startY, initialSize } =
        this.resizing;
      const containerRect = parentContainer.getBoundingClientRect();

      if (isHorizontal) {
        const deltaX = e.clientX - startX;
        const newWidth = initialSize + deltaX;
        const maxWidth = containerRect.width - 150; // Leave space for other splits

        if (newWidth >= 150 && newWidth <= maxWidth) {
          const percentage = (newWidth / containerRect.width) * 100;
          element.style.flex = "none";
          element.style.width = `${percentage}%`;
        }
      } else {
        const deltaY = e.clientY - startY;
        const newHeight = initialSize + deltaY;
        const maxHeight = containerRect.height - 100;

        if (newHeight >= 100 && newHeight <= maxHeight) {
          const percentage = (newHeight / containerRect.height) * 100;
          element.style.flex = "none";
          element.style.height = `${percentage}%`;
        }
      }
    };

    const stopResize = () => {
      this.resizing = null;
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    };

    handle.addEventListener("mousedown", startResize);
  }

  printToOutput(outputElement, text, className = "", useTypewriter = false) {
    if (!text) {
      outputElement.innerHTML = "";
      return Promise.resolve();
    }

    const line = document.createElement("div");
    line.className = className;
    line.style.whiteSpace = "pre-wrap";
    line.style.marginBottom = "0.5rem";

    outputElement.appendChild(line);
    this.scrollToBottom(outputElement.closest(".terminal-content"));

    if (useTypewriter && !text.includes("<")) {
      return this.typeText(line, text, 20);
    } else if (useTypewriter && text.includes("<")) {
      return this.typeHTML(line, text, 20);
    } else {
      line.textContent = text;
      return Promise.resolve();
    }
  }

  scrollToBottom(terminalContent) {
    if (!terminalContent) return;
    if (terminalContent.scrollHeight > terminalContent.clientHeight) {
      const currentScrollTop = terminalContent.scrollTop;
      const maxScroll =
        terminalContent.scrollHeight - terminalContent.clientHeight;
      if (currentScrollTop < maxScroll) {
        terminalContent.scrollTop = maxScroll;

        // Use requestAnimationFrame to ensure scroll happens after render
        requestAnimationFrame(() => {
          terminalContent.scrollTop = maxScroll;
        });
      }
    }
  }

  handleCommand(inputElement) {
    const terminal = this.terminals.find((t) => t.input === inputElement);
    if (!terminal) return;

    const command = inputElement.value.trim().toLowerCase();
    const outputElement = inputElement
      .closest(".terminal-content")
      .querySelector("[id^='output']");

    this.printToOutput(outputElement, `➜ ${command}`, "command");
    terminal.history.push(command);
    terminal.historyIndex = -1;
    inputElement.value = "";
    const [cmd, ...args] = command.split(" ");
    switch (cmd) {
      case "help":
        this.showHelp(outputElement);
        break;
      case "about":
        this.showAbout(outputElement);
        break;
      case "experience":
        this.showExperience(outputElement);
        break;
      case "education":
        this.showEducation(outputElement);
        break;
      case "skills":
        this.showSkills(outputElement);
        break;
      case "contact":
        this.showContact(outputElement);
        break;
      case "clear":
        outputElement.innerHTML = "";
        this.printWelcomeMessage(outputElement);
        break;
      case "projects":
        this.showProjects();
        break;
      case "skills-visual":
        this.showSkillsVisualization();
        break;
      case "game":
        this.initGame();
        break;
      case "pdf":
        this.generatePDF();
        break;
      case "linkedin-cover":
        this.generateLinkedInCover(outputElement);
        break;
      case "exit-game":
        this.endGame();
        this.printToOutput(outputElement, "Game exited.", "info");
        break;
      case "matrix":
        this.startMatrixEffect(outputElement);
        break;
      case "stop-matrix":
        this.stopMatrixEffect();
        this.printToOutput(outputElement, "Matrix effect stopped.", "info");
        break;
      case "calc":
      case "calculate":
        this.calculate(args.join(" "), outputElement);
        break;
      case "social":
        this.showSocial(outputElement);
        break;
      case "cv":
        this.generatePDF();
        break;
      case "whoami":
        this.printToOutput(outputElement, "dani-ramos-merino", "");
        break;
      case "pwd":
        this.printToOutput(outputElement, "/home/dani/resume", "");
        break;
      case "date":
        this.printToOutput(outputElement, new Date().toString(), "");
        break;
      case "echo":
        this.printToOutput(outputElement, args.join(" "), "");
        break;
      case "history":
        this.showHistory(outputElement, terminal);
        break;
      case "ls":
        this.listFiles(outputElement, args[0] || "/resume");
        break;
      case "cat":
        this.catFile(outputElement, args[0]);
        break;
      case "open":
        this.openLink(outputElement, args[0]);
        break;
      case "":
        break;
      default:
        this.printToOutput(
          outputElement,
          `Command not found: ${command}. Type 'help' for available commands.`,
          "error"
        );
    }

    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  printWelcomeMessage(outputElement = this.output) {
    const asciiArt = `██████╗  █████╗ ███╗   ██╗██╗
██╔══██╗██╔══██╗████╗  ██║██║
██║  ██║███████║██╔██╗ ██║██║
██║  ██║██╔══██║██║╚██╗██║██║
██████╔╝██║  ██║██║ ╚████║██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝`;

    const divider = "─────────────────────────────────────────────────";

    const welcome =
      this.wrapWithColor(asciiArt + "\n", "#ff8c42") +
      this.wrapWithColor(divider + "\n", "#555555") +
      this.wrapWithColor(
        "              CV Interactivo en Terminal\n",
        "#888888"
      ) +
      this.wrapWithColor(
        "    Full Stack • Headless WP • Next.js • PHP • WooCommerce\n",
        "#666666"
      ) +
      this.wrapWithColor(divider + "\n\n", "#555555") +
      this.wrapWithColor("Escribe ", "#666666") +
      this.wrapWithColor("'help'", "#87af87") +
      this.wrapWithColor(" para ver los comandos disponibles\n", "#666666") +
      this.wrapWithColor("Pulsa ", "#666666") +
      this.wrapWithColor("'tab'", "#87af87") +
      this.wrapWithColor(" para autocompletar", "#666666");

    const helpDiv = document.createElement("div");
    helpDiv.innerHTML = welcome;
    outputElement.appendChild(helpDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showHelp(outputElement = this.output) {
    const title = this.wrapWithColor("🚀 Available Commands\n\n", "#ffff00");

    const mainCommands =
      this.wrapWithColor("Main Commands:\n", "#00ffff") +
      this.wrapWithColor("• help", "#98fb98") +
      "       " +
      this.wrapWithColor("Show this help message\n", "#ffffff") +
      this.wrapWithColor("• about", "#98fb98") +
      "      " +
      this.wrapWithColor("Display my professional summary\n", "#ffffff") +
      this.wrapWithColor("• skills", "#98fb98") +
      "     " +
      this.wrapWithColor("View my technical expertise\n", "#ffffff") +
      this.wrapWithColor("• experience", "#98fb98") +
      " " +
      this.wrapWithColor("Show my work history\n", "#ffffff") +
      this.wrapWithColor("• education", "#98fb98") +
      "  " +
      this.wrapWithColor("View my educational background\n", "#ffffff") +
      this.wrapWithColor("• contact", "#98fb98") +
      "    " +
      this.wrapWithColor("Get my contact information\n", "#ffffff") +
      this.wrapWithColor("• clear", "#98fb98") +
      "      " +
      this.wrapWithColor("Clear the terminal screen\n", "#ffffff");

    const utilityCommands =
      "\n" +
      this.wrapWithColor("Utility Commands:\n", "#00ffff") +
      this.wrapWithColor("• projects", "#98fb98") +
      "        " +
      this.wrapWithColor("View my project showcase\n", "#ffffff") +
      this.wrapWithColor("• skills-visual", "#98fb98") +
      "   " +
      this.wrapWithColor("Show skills visualization\n", "#ffffff") +
      this.wrapWithColor("• social", "#98fb98") +
      "          " +
      this.wrapWithColor("Show social profiles\n", "#ffffff") +
      this.wrapWithColor("• game", "#98fb98") +
      "            " +
      this.wrapWithColor("Play a mini-game (snake)\n", "#ffffff") +
      this.wrapWithColor("• matrix", "#98fb98") +
      "          " +
      this.wrapWithColor("Start Matrix digital rain effect\n", "#ffffff") +
      this.wrapWithColor("• calc <expr>", "#98fb98") +
      "     " +
      this.wrapWithColor("Calculate mathematical expressions\n", "#ffffff") +
      this.wrapWithColor("• pdf | cv", "#98fb98") +
      "        " +
      this.wrapWithColor("Save the current page as PDF\n", "#ffffff") +
      this.wrapWithColor("• linkedin-cover", "#98fb98") +
      "   " +
      this.wrapWithColor("Generate a LinkedIn cover image\n", "#ffffff") +
      this.wrapWithColor("• open <target>", "#98fb98") +
      "    " +
      this.wrapWithColor("Open github/linkedin/email/portfolio\n", "#ffffff");

    const unixCommands =
      "\n" +
      this.wrapWithColor("Unix-style Commands:\n", "#00ffff") +
      this.wrapWithColor("• whoami", "#98fb98") +
      "          " +
      this.wrapWithColor("Print current user\n", "#ffffff") +
      this.wrapWithColor("• pwd", "#98fb98") +
      "             " +
      this.wrapWithColor("Print working directory\n", "#ffffff") +
      this.wrapWithColor("• ls [path]", "#98fb98") +
      "       " +
      this.wrapWithColor("List files in resume tree\n", "#ffffff") +
      this.wrapWithColor("• cat <file>", "#98fb98") +
      "      " +
      this.wrapWithColor("Print file contents\n", "#ffffff") +
      this.wrapWithColor("• date", "#98fb98") +
      "            " +
      this.wrapWithColor("Print current date\n", "#ffffff") +
      this.wrapWithColor("• echo <text>", "#98fb98") +
      "     " +
      this.wrapWithColor("Echo back the arguments\n", "#ffffff") +
      this.wrapWithColor("• history", "#98fb98") +
      "         " +
      this.wrapWithColor("Show command history\n", "#ffffff");

    const shortcuts =
      "\n" +
      this.wrapWithColor("Shortcuts:\n", "#666666") +
      this.wrapWithColor("• ", "#666666") +
      this.wrapWithColor("↑/↓", "#666666") +
      "         " +
      this.wrapWithColor("Navigate command history\n", "#444444") +
      this.wrapWithColor("• ", "#666666") +
      this.wrapWithColor("Tab", "#666666") +
      "         " +
      this.wrapWithColor("Auto-complete commands\n", "#444444") +
      this.wrapWithColor("• ", "#666666") +
      this.wrapWithColor("Ctrl+L", "#666666") +
      "      " +
      this.wrapWithColor("Clear the screen\n", "#444444") +
      this.wrapWithColor("• ", "#666666") +
      this.wrapWithColor("Ctrl+Shift+H", "#666666") +
      " " +
      this.wrapWithColor("Split horizontally\n", "#444444") +
      this.wrapWithColor("• ", "#666666") +
      this.wrapWithColor("Ctrl+Shift+V", "#666666") +
      " " +
      this.wrapWithColor("Split vertically", "#444444");

    const help = title + mainCommands + utilityCommands + unixCommands + shortcuts;

    const helpDiv = document.createElement("div");
    helpDiv.innerHTML = help;
    outputElement.appendChild(helpDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showAbout(outputElement = this.output) {
    const about = `<span style="color: #ff8c42; font-weight: bold;">✨ Sobre mí</span>

${this.wrapWithColor(
  "┌─────────────────────────────────────────────────────────┐",
  "#ff8c42"
)}
${this.wrapWithColor("│", "#ff8c42")} ${this.wrapWithColor(
      "Desarrollador Full Stack con +4 años en",
      "#ffffff"
    )}
${this.wrapWithColor("│", "#ff8c42")} ${this.wrapWithColor(
      "producción y +20 proyectos entregados.",
      "#ffffff"
    )}
${this.wrapWithColor(
  "└─────────────────────────────────────────────────────────┘",
  "#ff8c42"
)}

${this.wrapWithColor("⚡ Experiencia", "#ff8c42")}
${this.wrapWithColor(
  "   Construyo soluciones web seguras y escalables sobre PHP,",
  "#ffffff"
)}
${this.wrapWithColor("   JavaScript (React/Node.js) y CMS modernos", "#ff8c42")}

${this.wrapWithColor("⚡ Especialización", "#ff8c42")}
${this.wrapWithColor(
  "   Optimización de Core Web Vitals, SEO técnico y",
  "#ffffff"
)}
${this.wrapWithColor(
  "   ciberseguridad web (hardening, limpieza de malware)",
  "#ffffff"
)}

${this.wrapWithColor("⚡ Formación", "#ff8c42")}
${this.wrapWithColor(
  "   Estudiante de Ingeniería Informática en la UOC",
  "#ffffff"
)}
${this.wrapWithColor("   profundizando en arquitectura de software", "#ffffff")}

${this.wrapWithColor(
  "╭───────────────────────────────────────────────────────╮",
  "#ff8c42"
)}
${this.wrapWithColor("│", "#ff8c42")} ${this.wrapWithColor(
      "¿Tienes un proyecto en mente? ¡Hablemos!",
      "#ffffff"
    )} ${this.wrapWithColor("│", "#ff8c42")}
${this.wrapWithColor(
  "╰───────────────────────────────────────────────────────╯",
  "#ff8c42"
)}`;

    const aboutDiv = document.createElement("div");
    aboutDiv.innerHTML = about;
    outputElement.appendChild(aboutDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }
  wrapWithColor(text, color) {
    return `<span style="color: ${color}">${text}</span>`;
  }
  typeText(element, text, speed = 30) {
    if (!element || !text) return Promise.resolve();

    return new Promise((resolve) => {
      let index = 0;
      element.textContent = "";
      element.style.display = "inline-block";

      const interval = setInterval(() => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }
  async typeHTML(element, html, speed = 30) {
    if (!element || !html) return Promise.resolve();
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const walker = document.createTreeWalker(
      temp,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    const nodes = [];
    let currentNode;
    while ((currentNode = walker.nextNode())) {
      nodes.push(currentNode);
    }
    element.innerHTML = "";
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const span = document.createElement("span");
        element.appendChild(span);
        await this.typeText(span, node.textContent, speed);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        element.appendChild(clone);
        if (node.tagName === "STYLE" || !node.hasChildNodes()) {
          clone.innerHTML = node.innerHTML;
        }
      }
    }

    return Promise.resolve();
  }

  showExperience(outputElement = this.output) {
    const experience = `<span style="color: #ffff00; font-weight: bold;">💼 Experiencia Profesional</span>

<span style="color: #c1ff72;">ESLOOGAN 360 | Desarrollador Full Stack & Project Manager</span>
${this.wrapWithColor(
  "Feb 2026 - Actualidad | Valladolid, España",
  "#ffffff"
)}
${this.wrapWithColor(
  "Agencia digital",
  "#98fb98"
)}

• ${this.wrapWithColor("Headless WordPress", "#ffa07a")} - ${this.wrapWithColor(
      "Webs corporativas y e-commerce con Next.js + Faust.js + WPGraphQL.",
      "#ffffff"
    )}
• ${this.wrapWithColor("WooCommerce a medida", "#ffa07a")} - ${this.wrapWithColor(
      "Tiendas y entornos multi-tienda con back-office WordPress para el cliente.",
      "#ffffff"
    )}
• ${this.wrapWithColor("UX SPA", "#ffa07a")} - ${this.wrapWithColor(
      "Hidratación con fetch (sin recargas) y funciones personalizadas a medida.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Pasarelas de pago", "#ffa07a")} - ${this.wrapWithColor(
      "Integración de Stripe, PayPal, Redsys y APIs externas en flujos unificados.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Infraestructura", "#ffa07a")} - ${this.wrapWithColor(
      "SSH, reglas Nginx + Apache para enrutado híbrido Node/PHP, bloques Gutenberg custom.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Liderazgo", "#ffa07a")} - ${this.wrapWithColor(
      "Gestión de proyectos: trato con el cliente, control de plazos y coordinación del equipo técnico.",
      "#ffffff"
    )}

${this.wrapWithColor("Tecnologías:", "#c1ff72")} ${this.wrapWithColor(
      "Next.js, React, TypeScript, Faust.js, WPGraphQL, WordPress, WooCommerce, PHP, Nginx, Apache, SSH, Stripe, PayPal, Redsys",
      "#9d4edd"
    )}

<span style="color: #c1ff72;">DIPE - DESARROLLO WEB | Full Stack Web Developer</span>
${this.wrapWithColor(
  "Jun 2022 - Feb 2026 | Salamanca, España | 3 años 9 meses",
  "#ffffff"
)}
${this.wrapWithColor(
  "Agencia de desarrollo web",
  "#98fb98"
)}

• ${this.wrapWithColor("Gestión de proyectos", "#ffa07a")} - ${this.wrapWithColor(
      "Desarrollo integral y mantenimiento de +20 proyectos web (corporativos y e-commerce).",
      "#ffffff"
    )}
• ${this.wrapWithColor("Desarrollo a medida", "#ffa07a")} - ${this.wrapWithColor(
      "Programación de módulos y plugins en PHP para WordPress y PrestaShop.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Rendimiento", "#ffa07a")} - ${this.wrapWithColor(
      "Lighthouse Performance 40-55 → 90+ en 10+ proyectos. Cache server-side con Varnish y CDN.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Integraciones", "#ffa07a")} - ${this.wrapWithColor(
      "Conexión de APIs externas y configuración de pasarelas de pago.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Seguridad", "#ffa07a")} - ${this.wrapWithColor(
      "Limpieza forense de malware (10+ sitios recuperados), hardening y reglas ModSecurity (WAF).",
      "#ffffff"
    )}
• ${this.wrapWithColor("Migraciones PHP", "#ffa07a")} - ${this.wrapWithColor(
      "Gestión de versiones críticas de PHP en actualizaciones mayores sin caídas de servicio.",
      "#ffffff"
    )}

${this.wrapWithColor("Tecnologías:", "#c1ff72")} ${this.wrapWithColor(
      "PHP, JavaScript, MySQL/MariaDB, WordPress, WP-CLI, Composer, PrestaShop, Shopify, Varnish, ModSecurity, Nginx, Apache, Tailwind CSS, Git",
      "#9d4edd"
    )}

<span style="color: #c1ff72;">MADISON EXPERIENCE MARKETING | Web Developer (Prácticas FCT)</span>
${this.wrapWithColor(
  "Oct 2021 - Dic 2021 | Valladolid, España",
  "#ffffff"
)}

• ${this.wrapWithColor("Duero Wine Fest", "#ffa07a")} - ${this.wrapWithColor(
      "Sistema de control de aforos por códigos QR para eventos masivos.",
      "#ffffff"
    )}
• ${this.wrapWithColor("Pucela Run", "#ffa07a")} - ${this.wrapWithColor(
      "Frontend y lógica de tracking para carrera virtual (mapeo y kilometraje).",
      "#ffffff"
    )}
• ${this.wrapWithColor("Bases de datos", "#ffa07a")} - ${this.wrapWithColor(
      "Diseño y gestión de BBDD relacionales para registro de usuarios.",
      "#ffffff"
    )}

${this.wrapWithColor("Tecnologías:", "#c1ff72")} ${this.wrapWithColor(
      "JavaScript, HTML5, CSS3, PHP, MySQL",
      "#9d4edd"
    )}`;

    const experienceDiv = document.createElement("div");
    experienceDiv.innerHTML = experience;
    outputElement.appendChild(experienceDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showEducation(outputElement = this.output) {
    const education = `<span style="color: #ff8c42; font-weight: bold;">🎓 Educación</span>

${this.wrapWithColor(
  "┌──────────────────────────────────────────────────────┐",
  "#ff8c42"
)}
${this.wrapWithColor("│", "#ff8c42")}${this.wrapWithColor(
      " Grado en Ingeniería Informática (en curso) ",
      "#ffffff"
    )}${this.wrapWithColor("│", "#ff8c42")}
${this.wrapWithColor(
  "└──────────────────────────────────────────────────────┘",
  "#ff8c42"
)}

${this.wrapWithColor("🏛️  Institución:", "#ff8c42")} ${this.wrapWithColor(
      "Universitat Oberta de Catalunya (UOC)",
      "#ffffff"
    )}
${this.wrapWithColor("📅 Duración:", "#ff8c42")}    ${this.wrapWithColor(
      "2024 - Actualidad",
      "#ffffff"
    )}
${this.wrapWithColor("📍 Modalidad:", "#ff8c42")}   ${this.wrapWithColor(
      "Online, España",
      "#ffffff"
    )}

${this.wrapWithColor(
  "┌──────────────────────────────────────────────────────┐",
  "#ff8c42"
)}
${this.wrapWithColor("│", "#ff8c42")}${this.wrapWithColor(
      " Téc. Sup. Desarrollo de Aplicaciones Web ",
      "#ffffff"
    )}${this.wrapWithColor("│", "#ff8c42")}
${this.wrapWithColor(
  "└──────────────────────────────────────────────────────┘",
  "#ff8c42"
)}

${this.wrapWithColor("🏛️  Institución:", "#ff8c42")} ${this.wrapWithColor(
      "C.I.F.P. Ponferrada",
      "#ffffff"
    )}
${this.wrapWithColor("📅 Duración:", "#ff8c42")}    ${this.wrapWithColor(
      "2019 - 2022",
      "#ffffff"
    )}
${this.wrapWithColor("📍 Ubicación:", "#ff8c42")}   ${this.wrapWithColor(
      "Ponferrada, España",
      "#ffffff"
    )}

${this.wrapWithColor("📚 Formación complementaria:", "#ff8c42")}
${this.wrapWithColor("   • React - The Complete Guide (incl. Next.js, Redux)", "#ffffff")}
${this.wrapWithColor("   • The Complete JavaScript Course 2025", "#ffffff")}
${this.wrapWithColor("   • 100 Days of Code: Python Pro Bootcamp", "#ffffff")}
${this.wrapWithColor("   • Angular - The Complete Guide (2025 Edition)", "#ffffff")}`;

    const educationDiv = document.createElement("div");
    educationDiv.innerHTML = education;
    outputElement.appendChild(educationDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showSkills(outputElement = this.output) {
    const skills = `<span style="color: #ffff00; font-weight: bold;">🛠️  STACK TÉCNICO</span>

${this.wrapWithColor("▸ Lenguajes", "#ff8c42")}
• ${this.wrapWithColor("PHP", "#ffffff")}
• ${this.wrapWithColor("JavaScript (ES6+)", "#ffffff")}
• ${this.wrapWithColor("TypeScript", "#ffffff")}
• ${this.wrapWithColor("HTML5", "#ffffff")}
• ${this.wrapWithColor("CSS3", "#ffffff")}
• ${this.wrapWithColor("SQL", "#ffffff")}
• ${this.wrapWithColor("Python (básico)", "#ffffff")}

${this.wrapWithColor("▸ Frontend", "#ff8c42")}
• ${this.wrapWithColor("React.js", "#ffffff")}
• ${this.wrapWithColor("Next.js", "#ffffff")}
• ${this.wrapWithColor("Astro", "#ffffff")}
• ${this.wrapWithColor("Redux", "#ffffff")}
• ${this.wrapWithColor("Tailwind CSS", "#ffffff")}
• ${this.wrapWithColor("Bootstrap", "#ffffff")}

${this.wrapWithColor("▸ Backend / APIs", "#ff8c42")}
• ${this.wrapWithColor("Node.js (Express)", "#ffffff")}
• ${this.wrapWithColor("PHP", "#ffffff")}
• ${this.wrapWithColor("GraphQL (WPGraphQL)", "#ffffff")}
• ${this.wrapWithColor("APIs REST", "#ffffff")}

${this.wrapWithColor("▸ CMS / E-commerce", "#ff8c42")}
• ${this.wrapWithColor("WordPress (temas, plugins, headless)", "#ffffff")}
• ${this.wrapWithColor("WooCommerce (incl. multi-tienda)", "#ffffff")}
• ${this.wrapWithColor("Faust.js", "#ffffff")}
• ${this.wrapWithColor("PrestaShop (temas y módulos)", "#ffffff")}
• ${this.wrapWithColor("Shopify", "#ffffff")}
• ${this.wrapWithColor("Stripe / PayPal", "#ffffff")}

${this.wrapWithColor("▸ DevOps / Infraestructura", "#ff8c42")}
• ${this.wrapWithColor("Git / GitHub", "#ffffff")}
• ${this.wrapWithColor("SSH / Linux CLI", "#ffffff")}
• ${this.wrapWithColor("Nginx + Apache (enrutado híbrido Node/PHP)", "#ffffff")}
• ${this.wrapWithColor("Varnish (cache server-side)", "#ffffff")}
• ${this.wrapWithColor("Gestión de versiones de PHP en actualizaciones mayores", "#ffffff")}
• ${this.wrapWithColor("npm / pnpm / Vite", "#ffffff")}
• ${this.wrapWithColor("WP-CLI + Composer", "#ffffff")}

${this.wrapWithColor("▸ Seguridad / Rendimiento", "#ff8c42")}
• ${this.wrapWithColor("Core Web Vitals (Lighthouse 40→90+ en 10+ proyectos)", "#ffffff")}
• ${this.wrapWithColor("SEO Técnico + WCAG / Accesibilidad", "#ffffff")}
• ${this.wrapWithColor("Limpieza forense de malware (10+ sitios recuperados)", "#ffffff")}
• ${this.wrapWithColor("Hardening de servidores + ModSecurity (WAF)", "#ffffff")}

${this.wrapWithColor("▸ Liderazgo / Proceso", "#ff8c42")}
• ${this.wrapWithColor("Gestión de proyectos (PM)", "#ffffff")}
• ${this.wrapWithColor("Trato con el cliente + control de plazos", "#ffffff")}
• ${this.wrapWithColor("Coordinación equipo técnico", "#ffffff")}`;

    const skillsDiv = document.createElement("div");
    skillsDiv.innerHTML = skills;
    outputElement.appendChild(skillsDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showContact(outputElement = this.output) {
    const contact = `<span style="color: #ff8c42; font-weight: bold;">📫 Contacto</span>

${this.wrapWithColor("┌─────────────────────────────────────────────┐", "#ff8c42")}
${this.wrapWithColor("│", "#ff8c42")} ${this.wrapWithColor(
      "¡Conectemos y construyamos algo grande juntos!",
      "#ffffff"
    )} ${this.wrapWithColor("│", "#ff8c42")}
${this.wrapWithColor("└─────────────────────────────────────────────┘", "#ff8c42")}

${this.wrapWithColor("✉ ", "#ff8c42")} ${this.wrapWithColor(
      "Email:",
      "#ff8c42"
    )}    ${this.wrapWithColor(
      '<a href="mailto:ramosmerinodaniel@gmail.com" style="color: #ffffff; text-decoration: none;">ramosmerinodaniel@gmail.com</a>',
      "#ffffff"
    )}

${this.wrapWithColor("⚡", "#ff8c42")}  ${this.wrapWithColor(
      "GitHub:",
      "#ff8c42"
    )}   ${this.wrapWithColor(
      '<a href="https://github.com/machachee" target="_blank" style="color: #ffffff; text-decoration: none;">github.com/machachee</a>',
      "#ffffff"
    )}

${this.wrapWithColor("💼", "#ff8c42")}  ${this.wrapWithColor(
      "LinkedIn:",
      "#ff8c42"
    )} ${this.wrapWithColor(
      '<a href="https://www.linkedin.com/in/daniramosmerino/" target="_blank" style="color: #ffffff; text-decoration: none;">linkedin.com/in/daniramosmerino</a>',
      "#ffffff"
    )}

${this.wrapWithColor("📍", "#ff8c42")}  ${this.wrapWithColor(
      "Ubicación:",
      "#ff8c42"
    )} ${this.wrapWithColor("Valladolid, España", "#ffffff")}

${this.wrapWithColor("╭─────────────────────────────────────────────╮", "#ff8c42")}
${this.wrapWithColor("│", "#ff8c42")} ${this.wrapWithColor(
      "Abierto a oportunidades   no dudes en escribir",
      "#ffffff"
    )} ${this.wrapWithColor("│", "#ff8c42")}
${this.wrapWithColor("╰─────────────────────────────────────────────╯", "#ff8c42")}`;

    const contactDiv = document.createElement("div");
    contactDiv.innerHTML = contact;
    outputElement.appendChild(contactDiv);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  closeSplit(terminalContent) {
    const container = terminalContent.parentElement;
    const input = terminalContent.querySelector("input");
    const terminalIndex = this.terminals.findIndex((t) => t.input === input);
    if (terminalIndex > -1) {
      this.terminals.splice(terminalIndex, 1);
    }
    terminalContent.remove();
    if (
      container.children.length <= 1 &&
      container !== this.terminalContainer
    ) {
      if (container.children.length === 1) {
        const remainingContent = container.firstElementChild;
        container.parentElement.insertBefore(remainingContent, container);
      }
      container.remove();
    }
    if (this.terminals.length > 0) {
      const newActiveIndex = Math.min(terminalIndex, this.terminals.length - 1);
      this.terminals[newActiveIndex].input.focus();
      this.activeTerminal = newActiveIndex;
    }
  }

  loadProjects() {
    this.projects = [
      {
        title: "Interactive Portfolio (este sitio)",
        description:
          "Portfolio neo-brutalista construido con Astro + TypeScript. Incluye terminal interactivo con temas, mapa de trayectoria con Leaflet e i18n ES/EN.",
        image: "/image/avatar.png",
        technologies: ["Astro", "TypeScript", "Tailwind CSS", "Leaflet"],
        demo: "/",
        repo: "https://github.com/machachee",
      },
      {
        title: "Headless WordPress + Next.js (Esloogan 360)",
        description:
          "Webs corporativas con WordPress Headless: front en Next.js + Faust.js consumiendo WPGraphQL. Hidratación con fetch (sin recargas), back-office WP para el cliente y SEO técnico cuidado.",
        image: "/image/avatar.png",
        technologies: ["Next.js", "Faust.js", "WPGraphQL", "WordPress", "TypeScript", "Tailwind CSS"],
        demo: "https://github.com/machachee",
        repo: "https://github.com/machachee",
      },
      {
        title: "WooCommerce Headless multi-tienda (Esloogan 360)",
        description:
          "Tiendas a medida sobre WooCommerce con front en Next.js. Gestión multi-tienda desde un único back, integración de Stripe y PayPal, y funciones personalizadas de checkout.",
        image: "/image/avatar.png",
        technologies: ["Next.js", "WooCommerce", "WPGraphQL", "Stripe", "PayPal", "PHP"],
        demo: "https://github.com/machachee",
        repo: "https://github.com/machachee",
      },
      {
        title: "Mantenimiento y hardening de +20 webs (DIPE)",
        description:
          "Módulos y plugins WordPress/PrestaShop, optimización Core Web Vitals, integración de pasarelas de pago, hardening de servidores y limpieza forense de malware.",
        image: "/image/avatar.png",
        technologies: ["PHP", "WordPress", "PrestaShop", "MySQL", "Tailwind CSS"],
        demo: "https://github.com/machachee",
        repo: "https://github.com/machachee",
      },
      {
        title: "Duero Wine Fest   Control de aforos QR (MADISON)",
        description:
          "Sistema de control de aforo por códigos QR para evento masivo. Backend en PHP + MySQL con app de validación en tiempo real.",
        image: "/image/avatar.png",
        technologies: ["PHP", "MySQL", "JavaScript"],
        demo: "https://github.com/machachee",
        repo: "https://github.com/machachee",
      },
    ];
  }

  loadSkills() {
    this.skills = {
      Lenguajes: {
        PHP: 90,
        "JavaScript (ES6+)": 90,
        TypeScript: 80,
        HTML5: 95,
        CSS3: 90,
        SQL: 80,
        Python: 50,
      },
      Frontend: {
        "React.js": 85,
        "Next.js": 80,
        Astro: 75,
        Redux: 70,
        "Tailwind CSS": 85,
        Bootstrap: 80,
      },
      "Backend / APIs": {
        "Node.js (Express)": 75,
        PHP: 90,
        "GraphQL (WPGraphQL)": 80,
        "APIs REST": 85,
      },
      "CMS / E-commerce": {
        WordPress: 90,
        "WordPress Headless": 85,
        WooCommerce: 85,
        "Faust.js": 80,
        PrestaShop: 85,
        Shopify: 70,
        Stripe: 80,
        PayPal: 80,
      },
      "Seguridad y Rendimiento": {
        "Core Web Vitals": 85,
        "Limpieza de malware": 80,
        "Hardening servidores": 80,
      },
    };
  }

  setupFileSystem() {
    this.fileSystem = {
      type: "directory",
      contents: {
      resume: {
        type: "directory",
        contents: {
          "about.txt": {
            type: "file",
            content:
              "Daniel Ramos Merino   Desarrollador Full Stack con 4+ años en producción. PHP, JavaScript (React/Node.js), WordPress y PrestaShop. Valladolid, España.",
          },
          "skills.md": {
            type: "file",
            content:
              "# Skills\n- PHP, JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL\n- React, Next.js, Astro, Node.js (Express), Tailwind CSS\n- WordPress (incl. Headless), WooCommerce, Faust.js, WPGraphQL\n- PrestaShop, Shopify, Stripe, PayPal\n- Core Web Vitals, SEO técnico, hardening, limpieza de malware",
          },
          "experience.md": {
            type: "file",
            content:
              "# Experiencia\n- Esloogan 360 (Feb 2026 - Actualidad)   Headless WP + Next.js + WooCommerce\n- DIPE Desarrollo Web (Jun 2022 - Feb 2026)   +20 webs WordPress/PrestaShop\n- MADISON Experience Marketing (Oct - Dic 2021)   Web Dev (FCT)",
          },
          "contact.txt": {
            type: "file",
            content:
              "Email:    ramosmerinodaniel@gmail.com\nGitHub:   https://github.com/machachee\nLinkedIn: https://www.linkedin.com/in/daniramosmerino/",
          },
          projects: {
            type: "directory",
            contents: {
              "portfolio.md": {
                type: "file",
                content:
                  "# Interactive Portfolio\nAstro + TypeScript + Tailwind. Terminal interactivo, mapa Leaflet y i18n ES/EN.",
              },
              "duero-wine-fest.md": {
                type: "file",
                content:
                  "# Duero Wine Fest\nControl de aforos por QR (PHP + MySQL + JS).",
              },
              "pucela-run.md": {
                type: "file",
                content:
                  "# Pucela Run\nApp de tracking para carrera virtual (mapeo, kilometraje).",
              },
            },
          },
        },
      },
      }, // cierra contents del root
    };
  }

  showSocial(outputElement = this.output) {
    const html = `<span style="color: #ff8c42; font-weight: bold;">🌐 Social</span>

${this.wrapWithColor("• GitHub:   ", "#ff8c42")}<a href="https://github.com/machachee" target="_blank" style="color:#ffffff;">github.com/machachee</a>
${this.wrapWithColor("• LinkedIn: ", "#ff8c42")}<a href="https://www.linkedin.com/in/daniramosmerino/" target="_blank" style="color:#ffffff;">linkedin.com/in/daniramosmerino</a>
${this.wrapWithColor("• Email:    ", "#ff8c42")}<a href="mailto:ramosmerinodaniel@gmail.com" style="color:#ffffff;">ramosmerinodaniel@gmail.com</a>

${this.wrapWithColor("Tip: usa ", "#888888")}${this.wrapWithColor("'open github'", "#98fb98")}${this.wrapWithColor(", ", "#888888")}${this.wrapWithColor("'open linkedin'", "#98fb98")}${this.wrapWithColor(" o ", "#888888")}${this.wrapWithColor("'open email'", "#98fb98")}${this.wrapWithColor(" para abrir directamente.", "#888888")}`;
    const div = document.createElement("div");
    div.innerHTML = html;
    outputElement.appendChild(div);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  showHistory(outputElement, terminal) {
    if (!terminal.history.length) {
      this.printToOutput(outputElement, "(history vacío)", "info");
      return;
    }
    const lines = terminal.history
      .map((cmd, i) => `${String(i + 1).padStart(3)}  ${cmd}`)
      .join("\n");
    this.printToOutput(outputElement, lines, "");
  }

  listFiles(outputElement, path) {
    const cleanPath = (path || "").replace(/^\/+|\/+$/g, "");
    const target = cleanPath ? this.navigateFileSystem(cleanPath) : this.fileSystem.contents.resume;
    if (!target || target.type !== "directory") {
      this.printToOutput(outputElement, `ls: cannot access '${path}': No such directory`, "error");
      return;
    }
    const entries = Object.entries(target.contents).map(([name, node]) => {
      const color = node.type === "directory" ? "#87cefa" : "#ffffff";
      const suffix = node.type === "directory" ? "/" : "";
      return `<span style="color:${color}">${name}${suffix}</span>`;
    });
    const div = document.createElement("div");
    div.innerHTML = entries.join("    ");
    outputElement.appendChild(div);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  catFile(outputElement, path) {
    if (!path) {
      this.printToOutput(outputElement, "cat: missing operand", "error");
      return;
    }
    const cleanPath = path.replace(/^\/+/, "");
    const lookupPath = cleanPath.startsWith("resume/") ? cleanPath : `resume/${cleanPath}`;
    const node = this.navigateFileSystem(lookupPath);
    if (!node) {
      this.printToOutput(outputElement, `cat: ${path}: No such file`, "error");
      return;
    }
    if (node.type !== "file") {
      this.printToOutput(outputElement, `cat: ${path}: Is a directory`, "error");
      return;
    }
    this.printToOutput(outputElement, node.content, "");
  }

  openLink(outputElement, target) {
    const links = {
      github: "https://github.com/machachee",
      linkedin: "https://www.linkedin.com/in/daniramosmerino/",
      email: "mailto:ramosmerinodaniel@gmail.com",
      portfolio: "/",
      cv: null,
    };
    if (!target) {
      this.printToOutput(
        outputElement,
        "Uso: open [github|linkedin|email|portfolio]",
        "error"
      );
      return;
    }
    const url = links[target.toLowerCase()];
    if (!url) {
      this.printToOutput(outputElement, `open: destino desconocido '${target}'`, "error");
      return;
    }
    window.open(url, target === "email" ? "_self" : "_blank");
    this.printToOutput(outputElement, `Abriendo ${target}...`, "info");
  }
  handleThemeChange(theme) {
    this.terminal.className = `terminal theme-${theme}`;
    localStorage.setItem("theme", theme);
    this.currentTheme = theme;
    this.closeModal(this.themeModal);
  }
  showModal(modal) {
    modal.classList.add("active");
  }

  closeModal(modal) {
    modal.classList.remove("active");
  }
  showProjects() {
    const container = this.projectsModal.querySelector(".projects-container");
    container.innerHTML = this.projects
      .map(
        (project) => `
      <div class="project-card">
        <img src="${project.image}" alt="${
          project.title
        }" class="project-image">
        <div class="project-details">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.technologies
              .map(
                (tech) => `
              <span class="tech-tag">${tech}</span>
            `
              )
              .join("")}
          </div>
          <div class="project-links">
            <a href="${project.demo}" class="project-link" target="_blank">
              <i class="fas fa-external-link-alt"></i> Demo
            </a>
            <a href="${project.repo}" class="project-link" target="_blank">
              <i class="fab fa-github"></i> Repository
            </a>
          </div>
        </div>
      </div>
    `
      )
      .join("");
    this.showModal(this.projectsModal);
  }
  showSkillsVisualization() {
    const container = this.skillsModal.querySelector(".skills-container");
    container.innerHTML = Object.entries(this.skills)
      .map(
        ([category, skills]) => `
      <div class="skill-category">
        <h3 class="skill-category-title">${category}</h3>
        <div class="skill-bars">
          ${Object.entries(skills)
            .map(
              ([skill, level]) => `
            <div class="skill-item">
              <div class="skill-info">
                <span class="skill-name">${skill}</span>
                <span class="skill-level">${level}%</span>
              </div>
              <div class="skill-progress">
                <div class="skill-progress-bar" style="width: ${level}%"></div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
      )
      .join("");
    this.showModal(this.skillsModal);
  }
  navigateFileSystem(path) {
    const parts = path.split("/").filter(Boolean);
    let current = this.fileSystem;
    for (const part of parts) {
      if (current.type !== "directory" || !current.contents[part]) {
        return null;
      }
      current = current.contents[part];
    }
    return current;
  }
  async generatePDF() {
    const outputElement = this.terminals[this.activeTerminal].input
      .closest(".terminal-content")
      .querySelector("[id^='output']");
    this.printToOutput(
      outputElement,
      "Abriendo diálogo de impresión... selecciona 'Guardar como PDF'.",
      "info"
    );
    setTimeout(() => window.print(), 250);
  }
  initGame() {
    this.endGame();
    this.gameActive = true;

    const outputElement = this.terminals[this.activeTerminal].input
      .closest(".terminal-content")
      .querySelector("[id^='output']");

    const gameContainer = document.createElement("div");
    gameContainer.className = "game-container";
    gameContainer.id = "snake-game-container";
    gameContainer.innerHTML = `
      <div class="game-instructions">
        <p>Snake Game: Use arrow keys to move.</p>
        <p>Press P to pause, SPACE to restart, ESC to exit.</p>
      </div>
      <div id="snake-game-score">Score: 0</div>
      <div id="snake-game-canvas"></div>
    `;

    outputElement.appendChild(gameContainer);
    this.initSnakeGame();
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  endGame() {
    if (!this.gameActive) return;

    this.gameActive = false;
    if (this.gameHandler) {
      document.removeEventListener("keydown", this.gameHandler);
      this.gameHandler = null;
    }
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
    const gameContainer = document.getElementById("snake-game-container");
    if (gameContainer) {
      gameContainer.remove();
    }
  }

  initSnakeGame() {
    const sketch = (p) => {
      const gridSize = 20;
      const canvasWidth = 400;
      const canvasHeight = 300;
      let snake = [];
      let food;
      let direction = { x: 1, y: 0 };
      let nextDirection = { x: 1, y: 0 };
      let score = 0;
      let gameOver = false;
      let frameRate = 10;
      let isPaused = false;

      p.setup = () => {
        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent("snake-game-canvas");
        p.frameRate(frameRate);
        resetGame();
      };

      p.draw = () => {
        p.background(0);

        if (isPaused) {
          drawGrid();
          p.fill(255);
          p.textSize(24);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("PAUSED", canvasWidth / 2, canvasHeight / 2);
          p.textSize(16);
          p.text("Press P to resume", canvasWidth / 2, canvasHeight / 2 + 30);
          return;
        }

        if (gameOver) {
          drawGrid();
          p.fill(255, 0, 0);
          p.textSize(24);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("Game Over!", canvasWidth / 2, canvasHeight / 2 - 20);
          p.textSize(16);
          p.text(`Score: ${score}`, canvasWidth / 2, canvasHeight / 2 + 20);
          p.text(
            "Press SPACE to restart",
            canvasWidth / 2,
            canvasHeight / 2 + 50
          );
          return;
        }
        direction = nextDirection;
        moveSnake();
        checkCollision();
        checkFood();
        drawGrid();
        drawSnake();
        drawFood();
        updateScore();
      };

      p.keyPressed = () => {
        if (p.keyCode === 80) {
          isPaused = !isPaused;
          return false;
        }

        if (isPaused) return false;

        if (p.keyCode === p.UP_ARROW && direction.y !== 1) {
          nextDirection = { x: 0, y: -1 };
        } else if (p.keyCode === p.DOWN_ARROW && direction.y !== -1) {
          nextDirection = { x: 0, y: 1 };
        } else if (p.keyCode === p.LEFT_ARROW && direction.x !== 1) {
          nextDirection = { x: -1, y: 0 };
        } else if (p.keyCode === p.RIGHT_ARROW && direction.x !== -1) {
          nextDirection = { x: 1, y: 0 };
        } else if (p.keyCode === 32 && gameOver) {
          resetGame();
        } else if (p.keyCode === 27) {
          this.endGame();
        }
        if (
          [
            p.UP_ARROW,
            p.DOWN_ARROW,
            p.LEFT_ARROW,
            p.RIGHT_ARROW,
            32,
            27,
            80,
          ].includes(p.keyCode)
        ) {
          return false;
        }
      };

      function resetGame() {
        snake = [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        gameOver = false;
        placeFood();
        updateScore();
      }

      function moveSnake() {
        const head = {
          x: snake[0].x + direction.x,
          y: snake[0].y + direction.y,
        };

        // Wrap around edges
        if (head.x < 0) head.x = Math.floor(canvasWidth / gridSize) - 1;
        if (head.x >= canvasWidth / gridSize) head.x = 0;
        if (head.y < 0) head.y = Math.floor(canvasHeight / gridSize) - 1;
        if (head.y >= canvasHeight / gridSize) head.y = 0;
        snake.unshift(head);
        if (head.x !== food.x || head.y !== food.y) {
          snake.pop();
        } else {
          placeFood();
          score += 10;
          // Increase speed slightly with each food
          if (frameRate < 20) {
            frameRate += 0.5;
            p.frameRate(frameRate);
          }
        }
      }

      function checkCollision() {
        // Check if snake collides with itself
        const head = snake[0];
        for (let i = 1; i < snake.length; i++) {
          if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
          }
        }
      }

      function checkFood() {
        const head = snake[0];
        if (head.x === food.x && head.y === food.y) {
          placeFood();
          score += 10;
        }
      }

      function placeFood() {
        // Find a position for food that's not occupied by the snake
        let validPosition = false;
        while (!validPosition) {
          food = {
            x: Math.floor(p.random(canvasWidth / gridSize)),
            y: Math.floor(p.random(canvasHeight / gridSize)),
          };

          validPosition = true;
          for (const segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
              validPosition = false;
              break;
            }
          }
        }
      }

      function drawSnake() {
        p.noStroke();
        for (let i = 1; i < snake.length; i++) {
          p.fill(0, 255, 0); // Green body
          p.rect(
            snake[i].x * gridSize,
            snake[i].y * gridSize,
            gridSize - 2,
            gridSize - 2,
            4
          );
        }
        p.fill(0, 200, 0); // Darker green head
        p.rect(
          snake[0].x * gridSize,
          snake[0].y * gridSize,
          gridSize - 2,
          gridSize - 2,
          6
        );
      }

      function drawFood() {
        p.fill(255, 0, 0); // Red food
        p.ellipse(
          food.x * gridSize + gridSize / 2,
          food.y * gridSize + gridSize / 2,
          gridSize * 0.8,
          gridSize * 0.8
        );
      }

      function drawGrid() {
        p.stroke(30);
        p.strokeWeight(0.5);
        for (let x = 0; x <= canvasWidth; x += gridSize) {
          p.line(x, 0, x, canvasHeight);
        }
        for (let y = 0; y <= canvasHeight; y += gridSize) {
          p.line(0, y, canvasWidth, y);
        }
      }

      function updateScore() {
        const scoreElement = document.getElementById("snake-game-score");
        if (scoreElement) {
          scoreElement.textContent = `Score: ${score}`;
        }
      }
    };
    this.p5Instance = new p5(sketch);
  }
  startMatrixEffect(outputElement) {
    this.stopMatrixEffect();
    const matrixContainer = document.createElement("div");
    matrixContainer.className = "matrix-container";
    matrixContainer.id = "matrix-container";

    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    matrixContainer.appendChild(canvas);

    const instructions = document.createElement("div");
    instructions.className = "matrix-instructions";
    instructions.textContent = "Type 'stop-matrix' to exit";
    matrixContainer.appendChild(instructions);

    outputElement.appendChild(matrixContainer);
    const ctx = canvas.getContext("2d");
    canvas.width = matrixContainer.offsetWidth;
    canvas.height = 300;
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const columns = Math.floor(canvas.width / 20);
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -20);
    }
    const getMatrixColor = () => {
      const themeColors = {
        default: "#00ff00",
        dracula: "#50fa7b",
        solarized: "#859900",
        nord: "#a3be8c",
      };
      return themeColors[this.currentTheme] || "#00ff00";
    };
    const drawMatrix = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getMatrixColor();
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(char, i * 20, drops[i] * 20);
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };
    this.matrixInterval = setInterval(drawMatrix, 50);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }

  stopMatrixEffect() {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }

    const matrixContainer = document.getElementById("matrix-container");
    if (matrixContainer) {
      matrixContainer.remove();
    }
  }
  evalMathExpression(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
      const ch = input[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[0-9.]/.test(ch)) {
        let num = "";
        while (i < input.length && /[0-9.]/.test(input[i])) { num += input[i]; i++; }
        if ((num.match(/\./g) || []).length > 1) throw new Error("Malformed number");
        tokens.push({ type: "num", value: parseFloat(num) });
        continue;
      }
      if ("+-*/%()".includes(ch)) {
        tokens.push({ type: "op", value: ch });
        i++;
        continue;
      }
      throw new Error("Invalid character: " + ch);
    }
    const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2 };
    const output = [];
    const stack = [];
    let prev = null;
    for (const t of tokens) {
      if (t.type === "num") {
        output.push(t);
        prev = t;
        continue;
      }
      const op = t.value;
      if (op === "(") { stack.push(t); prev = t; continue; }
      if (op === ")") {
        while (stack.length && stack[stack.length - 1].value !== "(") output.push(stack.pop());
        if (!stack.length) throw new Error("Mismatched parentheses");
        stack.pop();
        prev = t;
        continue;
      }
      if ((op === "+" || op === "-") && (prev === null || (prev.type === "op" && prev.value !== ")"))) {
        output.push({ type: "num", value: 0 });
      }
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.value === "(") break;
        if (prec[top.value] >= prec[op]) output.push(stack.pop());
        else break;
      }
      stack.push(t);
      prev = t;
    }
    while (stack.length) {
      const top = stack.pop();
      if (top.value === "(" || top.value === ")") throw new Error("Mismatched parentheses");
      output.push(top);
    }
    const evalStack = [];
    for (const t of output) {
      if (t.type === "num") { evalStack.push(t.value); continue; }
      const b = evalStack.pop();
      const a = evalStack.pop();
      if (a === undefined || b === undefined) throw new Error("Malformed expression");
      switch (t.value) {
        case "+": evalStack.push(a + b); break;
        case "-": evalStack.push(a - b); break;
        case "*": evalStack.push(a * b); break;
        case "/": if (b === 0) throw new Error("Division by zero"); evalStack.push(a / b); break;
        case "%": evalStack.push(a % b); break;
        default: throw new Error("Unknown operator");
      }
    }
    if (evalStack.length !== 1) throw new Error("Malformed expression");
    return evalStack[0];
  }

  calculate(expression, outputElement) {
    if (!expression) {
      this.printToOutput(
        outputElement,
        "Please enter a mathematical expression. Usage: calc [expression]",
        "error"
      );
      return;
    }

    try {
      const result = this.evalMathExpression(expression);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid result");
      }
      const formattedResult =
        typeof result === "number" && !Number.isInteger(result)
          ? result.toFixed(4).replace(/\.?0+$/, "")
          : result.toString();

      const calculationHTML = `<div class="calculation">
        <div class="calculation-expression">${this.wrapWithColor(
          expression,
          "#87cefa"
        )}</div>
        <div class="calculation-result">${this.wrapWithColor(
          "= " + formattedResult,
          "#98fb98"
        )}</div>
      </div>`;

      this.printToOutput(outputElement, calculationHTML, "");
    } catch (error) {
      this.printToOutput(
        outputElement,
        `Error: Could not evaluate the expression. Make sure it's a valid mathematical expression.`,
        "error"
      );
    }
  }
  generateLinkedInCover(outputElement) {
    const coverContainer = document.createElement("div");
    coverContainer.className = "linkedin-cover-container";
    coverContainer.style.width = "100%";
    coverContainer.style.height = "300px";
    coverContainer.style.position = "relative";
    coverContainer.style.overflow = "hidden";
    coverContainer.style.borderRadius = "8px";
    coverContainer.style.marginTop = "10px";
    coverContainer.style.marginBottom = "20px";
    coverContainer.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
    coverContainer.style.border = "1px solid rgba(255,255,255,0.1)";
    const background = document.createElement("div");
    background.style.position = "absolute";
    background.style.top = "0";
    background.style.left = "0";
    background.style.width = "100%";
    background.style.height = "100%";
    background.style.backgroundColor = "#1e1e2e";
    background.style.zIndex = "1";
    coverContainer.appendChild(background);
    const terminalHeader = document.createElement("div");
    terminalHeader.style.position = "absolute";
    terminalHeader.style.top = "0";
    terminalHeader.style.left = "0";
    terminalHeader.style.width = "100%";
    terminalHeader.style.height = "30px";
    terminalHeader.style.backgroundColor = "#282a36";
    terminalHeader.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
    terminalHeader.style.display = "flex";
    terminalHeader.style.alignItems = "center";
    terminalHeader.style.padding = "0 10px";
    terminalHeader.style.zIndex = "2";
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.gap = "6px";

    const colors = ["#ff5f56", "#ffbd2e", "#27c93f"];
    colors.forEach((color) => {
      const button = document.createElement("div");
      button.style.width = "12px";
      button.style.height = "12px";
      button.style.borderRadius = "50%";
      button.style.backgroundColor = color;
      buttonsContainer.appendChild(button);
    });

    terminalHeader.appendChild(buttonsContainer);
    const terminalTitle = document.createElement("div");
    terminalTitle.textContent = "dani@machache: ~/interactive-resume";
    terminalTitle.style.color = "#f8f8f2";
    terminalTitle.style.fontSize = "12px";
    terminalTitle.style.fontFamily = "'Fira Code', monospace";
    terminalTitle.style.margin = "0 auto";
    terminalHeader.appendChild(terminalTitle);

    coverContainer.appendChild(terminalHeader);
    const terminalContent = document.createElement("div");
    terminalContent.style.position = "absolute";
    terminalContent.style.top = "30px";
    terminalContent.style.left = "0";
    terminalContent.style.width = "100%";
    terminalContent.style.height = "calc(100% - 30px)";
    terminalContent.style.padding = "15px";
    terminalContent.style.boxSizing = "border-box";
    terminalContent.style.zIndex = "2";
    terminalContent.style.overflow = "hidden";
    coverContainer.appendChild(terminalContent);
    const asciiArt = document.createElement("pre");
    asciiArt.style.color = "#d4843e";
    asciiArt.style.margin = "0";
    asciiArt.style.fontSize = "10px";
    asciiArt.style.fontFamily = "'Fira Code', monospace";
    asciiArt.style.lineHeight = "1";
    asciiArt.innerHTML = `██████╗  █████╗ ███╗   ██╗██╗
██╔══██╗██╔══██╗████╗  ██║██║
██║  ██║███████║██╔██╗ ██║██║
██║  ██║██╔══██║██║╚██╗██║██║
██████╔╝██║  ██║██║ ╚████║██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝`;
    terminalContent.appendChild(asciiArt);
    const divider = document.createElement("div");
    divider.style.width = "100%";
    divider.style.height = "1px";
    divider.style.backgroundColor = "#555555";
    divider.style.margin = "8px 0";
    terminalContent.appendChild(divider);
    const subtitle = document.createElement("div");
    subtitle.textContent = "Interactive Terminal Resume";
    subtitle.style.color = "#888888";
    subtitle.style.fontSize = "12px";
    subtitle.style.fontFamily = "'Fira Code', monospace";
    subtitle.style.textAlign = "center";
    subtitle.style.marginBottom = "5px";
    terminalContent.appendChild(subtitle);
    const role = document.createElement("div");
    role.textContent = "Full Stack Developer • PHP • React • Node.js";
    role.style.color = "#666666";
    role.style.fontSize = "10px";
    role.style.fontFamily = "'Fira Code', monospace";
    role.style.textAlign = "center";
    role.style.marginBottom = "10px";
    terminalContent.appendChild(role);
    const divider2 = document.createElement("div");
    divider2.style.width = "100%";
    divider2.style.height = "1px";
    divider2.style.backgroundColor = "#555555";
    divider2.style.margin = "8px 0";
    terminalContent.appendChild(divider2);
    const promptContainer = document.createElement("div");
    promptContainer.style.display = "flex";
    promptContainer.style.alignItems = "center";
    promptContainer.style.marginTop = "10px";

    const prompt = document.createElement("span");
    prompt.textContent = "➜";
    prompt.style.color = "#87af87";
    prompt.style.marginRight = "8px";
    prompt.style.fontSize = "14px";
    promptContainer.appendChild(prompt);

    const command = document.createElement("span");
    command.textContent = "help";
    command.style.color = "#f8f8f2";
    command.style.fontFamily = "'Fira Code', monospace";
    command.style.fontSize = "14px";
    promptContainer.appendChild(command);

    terminalContent.appendChild(promptContainer);
    const commandOutput = document.createElement("div");
    commandOutput.style.marginTop = "10px";
    const helpTitle = document.createElement("div");
    helpTitle.textContent = "🚀 Available Commands";
    helpTitle.style.color = "#ffff00";
    helpTitle.style.fontSize = "12px";
    helpTitle.style.fontWeight = "bold";
    helpTitle.style.marginBottom = "8px";
    commandOutput.appendChild(helpTitle);
    const mainCmdTitle = document.createElement("div");
    mainCmdTitle.textContent = "Main Commands:";
    mainCmdTitle.style.color = "#00ffff";
    mainCmdTitle.style.fontSize = "10px";
    mainCmdTitle.style.marginBottom = "4px";
    commandOutput.appendChild(mainCmdTitle);
    const mainCommands = [
      { cmd: "about", desc: "Display professional summary" },
      { cmd: "skills", desc: "View technical expertise" },
      { cmd: "experience", desc: "Show work history" },
    ];

    mainCommands.forEach((item) => {
      const cmdLine = document.createElement("div");
      cmdLine.style.display = "flex";
      cmdLine.style.fontSize = "10px";
      cmdLine.style.marginBottom = "4px";

      const cmdName = document.createElement("span");
      cmdName.textContent = "• " + item.cmd;
      cmdName.style.color = "#98fb98";
      cmdName.style.width = "80px";
      cmdLine.appendChild(cmdName);

      const cmdDesc = document.createElement("span");
      cmdDesc.textContent = item.desc;
      cmdDesc.style.color = "#ffffff";
      cmdLine.appendChild(cmdDesc);

      commandOutput.appendChild(cmdLine);
    });
    const utilityCmdTitle = document.createElement("div");
    utilityCmdTitle.textContent = "Utility Commands:";
    utilityCmdTitle.style.color = "#00ffff";
    utilityCmdTitle.style.fontSize = "10px";
    utilityCmdTitle.style.marginTop = "8px";
    utilityCmdTitle.style.marginBottom = "4px";
    commandOutput.appendChild(utilityCmdTitle);
    const utilityCommands = [
      { cmd: "game", desc: "Play a mini-game" },
      { cmd: "matrix", desc: "Start Matrix effect" },
    ];

    utilityCommands.forEach((item) => {
      const cmdLine = document.createElement("div");
      cmdLine.style.display = "flex";
      cmdLine.style.fontSize = "10px";
      cmdLine.style.marginBottom = "4px";

      const cmdName = document.createElement("span");
      cmdName.textContent = "• " + item.cmd;
      cmdName.style.color = "#98fb98";
      cmdName.style.width = "80px";
      cmdLine.appendChild(cmdName);

      const cmdDesc = document.createElement("span");
      cmdDesc.textContent = item.desc;
      cmdDesc.style.color = "#ffffff";
      cmdLine.appendChild(cmdDesc);

      commandOutput.appendChild(cmdLine);
    });

    terminalContent.appendChild(commandOutput);
    const urlContainer = document.createElement("div");
    urlContainer.style.position = "absolute";
    urlContainer.style.bottom = "10px";
    urlContainer.style.left = "0";
    urlContainer.style.width = "100%";
    urlContainer.style.textAlign = "center";

    const url = document.createElement("div");
    url.textContent = "machache.vercel.app";
    url.style.color = "#87cefa";
    url.style.fontSize = "12px";
    url.style.fontFamily = "'Fira Code', monospace";
    urlContainer.appendChild(url);

    terminalContent.appendChild(urlContainer);
    const instructions = document.createElement("div");
    instructions.innerHTML = "";
    instructions.style.position = "absolute";
    instructions.style.bottom = "10px";
    instructions.style.right = "10px";
    instructions.style.color = "#ffffff";
    instructions.style.opacity = "0.7";
    instructions.style.fontSize = "10px";
    instructions.style.zIndex = "3";
    coverContainer.appendChild(instructions);
    outputElement.appendChild(coverContainer);
    this.scrollToBottom(outputElement.closest(".terminal-content"));
  }
}
new TerminalResume();
