/**
 * highlight.js - 텍스트 하이라이트 모듈
 * Selection API를 사용한 텍스트 강조 기능
 */

const Highlight = {
  /**
   * 텍스트 노드 목록 가져오기
   */
  getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue) {
        nodes.push(node);
      }
    }
    return nodes;
  },

  /**
   * 인덱스 기반으로 Range 생성
   */
  createRangeFromTextIndex(startIndex, length) {
    const nodes = this.getTextNodes(document.body);
    let index = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;
    const endIndex = startIndex + length;

    for (const node of nodes) {
      const nodeLength = node.nodeValue.length;
      if (!startNode && startIndex <= index + nodeLength) {
        startNode = node;
        startOffset = Math.max(0, startIndex - index);
      }
      if (startNode && endIndex <= index + nodeLength) {
        endNode = node;
        endOffset = Math.max(0, endIndex - index);
        break;
      }
      index += nodeLength;
    }

    if (!startNode) return null;
    if (!endNode) {
      endNode = startNode;
      endOffset = Math.min(startNode.nodeValue.length, startOffset);
    }

    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  },

  /**
   * Selection API를 사용한 임시 하이라이트
   */
  addTemporary(range) {
    if (!range) return false;

    try {
      const rect = range.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top - window.innerHeight / 2;
      window.scrollTo({ top: scrollY, behavior: 'smooth' });

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      setTimeout(() => {
        selection.removeAllRanges();
      }, 4000);

      return true;
    } catch (error) {
      console.warn('Failed to highlight range:', error);
      const parent = range.startContainer?.parentElement;
      if (parent) {
        parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
    }
    return false;
  },

  /**
   * window.find() API를 사용한 텍스트 검색 및 하이라이트
   * Ctrl+F와 동일한 방식으로 텍스트를 찾아 스크롤
   */
  findAndHighlight(text) {
    if (!text) return false;

    // window.find()는 텍스트를 찾아 선택하고 자동으로 스크롤합니다
    const found = window.find(text, false, false, true, false, false, false);

    if (found) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // 선택된 텍스트의 부모 요소를 화면 중앙으로 스크롤
        const element = range.startContainer.parentElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // 4초 후 선택 해제
        setTimeout(() => {
          selection.removeAllRanges();
        }, 4000);
      }
      return true;
    }

    // Fallback: TreeWalker로 직접 검색
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const index = node.nodeValue.indexOf(text);
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + text.length);
        return this.addTemporary(range);
      }
    }

    return false;
  }
};

window.DT_Highlight = Highlight;
