import Prism from "prismjs";

/**
 * 为代码块应用语法高亮的核心函数
 */
function applyHighlight(codeElement: HTMLElement, preElement: HTMLPreElement) {
  // 获取语言类名
  const classNames = codeElement.className.match(/language-(\w+)/);
  const language = classNames ? classNames[1] : null;

  // 处理vue文件（作为HTML+JS混合语法高亮）
  if (language === "vue") {
    if (Prism.languages.markup) {
      const content = codeElement.textContent || "";
      const highlightedCode = Prism.highlight(
        content,
        Prism.languages.markup,
        "markup"
      );
      codeElement.innerHTML = highlightedCode;
      if (!preElement.className.includes(`language-vue`)) {
        preElement.className += ` language-vue`;
      }
    }
  } else if (language && Prism.languages[language]) {
    // 清除之前的高亮
    const content = codeElement.textContent || "";

    // 应用语法高亮
    const highlightedCode = Prism.highlight(
      content,
      Prism.languages[language],
      language
    );
    codeElement.innerHTML = highlightedCode;

    // 添加language类到pre元素
    if (!preElement.className.includes(`language-${language}`)) {
      preElement.className += ` language-${language}`;
    }
  } else if (!language) {
    // 没有指定语言，尝试检测代码块内容来自动添加类名
    const content = codeElement.textContent || "";
    let detectedLang = "";

    if (content.includes("import") && content.includes("from")) {
      detectedLang = "javascript";
    } else if (content.includes("<template>") && content.includes("<script>")) {
      detectedLang = "vue";
    } else if (
      content.includes("npm ") ||
      content.includes("yarn ") ||
      content.includes("pnpm ")
    ) {
      detectedLang = "bash";
    } else if (content.includes("interface ") && content.includes(": ")) {
      detectedLang = "typescript";
    }

    if (detectedLang) {
      codeElement.className += ` language-${detectedLang}`;
      // 处理检测到的语言
      if (detectedLang === "vue" && Prism.languages.markup) {
        const highlightedCode = Prism.highlight(
          content,
          Prism.languages.markup,
          "markup"
        );
        codeElement.innerHTML = highlightedCode;
      } else if (Prism.languages[detectedLang]) {
        const highlightedCode = Prism.highlight(
          content,
          Prism.languages[detectedLang],
          detectedLang
        );
        codeElement.innerHTML = highlightedCode;
      }
      preElement.className += ` language-${detectedLang}`;
    }
  }
}

/**
 * 为页面中的代码块应用语法高亮
 */
export function highlightCode() {
  // 使用nextTick确保DOM已更新
  setTimeout(() => {
    // 找到所有代码块
    const codeBlocks = document.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      const codeElement = block as HTMLElement;
      const preElement = codeElement.parentElement as HTMLPreElement;

      if (preElement) {
        applyHighlight(codeElement, preElement);
      }
    });
  }, 100);
}

/**
 * 为指定元素内的代码块应用语法高亮
 * @param element 要高亮的元素
 */
export function highlightElement(element: Element) {
  const codeBlocks = element.querySelectorAll("pre code");

  codeBlocks.forEach((block) => {
    const codeElement = block as HTMLElement;
    const preElement = codeElement.parentElement as HTMLPreElement;

    if (preElement) {
      applyHighlight(codeElement, preElement);
    }
  });
}
