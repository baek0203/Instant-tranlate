async function translateText(text, targetLang, sourceLang = 'auto', retryCount = 2) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // Google Translate API 무료 엔드포인트 사용
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

      console.log(`Translation attempt ${attempt} for text: ${text.substring(0, 50)}...`);

      // 5초 타임아웃
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Translation data received:', data);

      // 번역된 텍스트 추출
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach(item => {
          if (item[0]) {
            translatedText += item[0];
          }
        });
      }

      if (!translatedText) {
        throw new Error('Empty translation result');
      }

      // 성공하면 바로 반환
      console.log(`Translation successful: ${translatedText}`);
      return {
        success: true,
        translatedText: translatedText,
        detectedLanguage: data[2] || sourceLang
      };
    } catch (error) {
      console.error(`Translation attempt ${attempt} failed:`, error);

      // 마지막 시도가 아니면 재시도
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, 300)); // 0.3초 대기
        continue;
      }

      // 마지막 시도도 실패하면 에러 반환
      console.error('All translation attempts failed');
      return {
        success: false,
        error: error.message || 'Translation failed'
      };
    }
  }
}

// 대체 번역 API (MyMemory)
async function translateWithMyMemory(text, targetLang, sourceLang = 'auto') {
  try {
    const langPair = sourceLang === 'auto' ? `autodetect|${targetLang}` : `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData) {
      return {
        success: true,
        translatedText: data.responseData.translatedText,
        detectedLanguage: sourceLang
      };
    } else {
      throw new Error('MyMemory translation failed');
    }
  } catch (error) {
    console.error('MyMemory translation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// LibreTranslate API 사용 (옵션)
async function translateWithLibre(text, targetLang, sourceLang = 'auto') {
  try {
    const url = 'https://libretranslate.de/translate';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    const data = await response.json();

    if (data.translatedText) {
      return {
        success: true,
        translatedText: data.translatedText,
        detectedLanguage: sourceLang
      };
    } else {
      throw new Error('LibreTranslate translation failed');
    }
  } catch (error) {
    console.error('LibreTranslate error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 언어 코드 변환 (필요시)
function convertLanguageCode(lang) {
  const langMap = {
    'ko': 'ko',
    'en': 'en',
    'ja': 'ja',
    'zh': 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'ru': 'ru',
    'ar': 'ar',
    'pt': 'pt',
    'it': 'it',
    'vi': 'vi',
    'th': 'th',
    'id': 'id',
    'hi': 'hi'
  };

  return langMap[lang] || lang;
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    const targetLang = convertLanguageCode(request.targetLang);
    const sourceLang = request.sourceLang || 'auto';

    // Google Translate API로 번역
    (async () => {
      try {
        const result = await translateText(request.text, targetLang, sourceLang);
        sendResponse(result);
      } catch (error) {
        console.error('Translation error:', error);
        sendResponse({
          success: false,
          error: error.message || 'Translation failed'
        });
      }
    })();

    // 비동기 응답을 위해 true 반환
    return true;
  }

  if (request.action === 'detectLanguage') {
    // 언어 감지 요청 처리
    translateText(request.text, 'en', 'auto')
      .then(result => {
        sendResponse({
          success: true,
          detectedLanguage: result.detectedLanguage
        });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true;
  }
});

// 모든 탭에 content script 주입하는 헬퍼 함수
async function injectContentScriptToAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      // chrome:// 같은 특수 페이지는 제외
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        continue;
      }

      try {
        // content script 주입
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['i18n.js', 'content.js']
        });

        // CSS 주입
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['styles.css']
        });

        console.log(`Content script injected to tab ${tab.id}`);
      } catch (error) {
        // 일부 탭은 권한이 없어서 실패할 수 있음 (무시)
        console.log(`Failed to inject to tab ${tab.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Failed to inject content scripts:', error);
  }
}

// 확장 프로그램 설치/업데이트 시
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('텍스트 번역기가 설치되었습니다.');

    // 기본 설정 저장
    chrome.storage.sync.set({
      defaultTargetLang: 'ko',
      autoDetect: true,
      showAllTranslations: false
    });

    // 이미 열려있는 모든 탭에 content script 주입
    await injectContentScriptToAllTabs();
  } else if (details.reason === 'update') {
    console.log('텍스트 번역기가 업데이트되었습니다.');

    // 업데이트 시에도 모든 탭에 재주입
    await injectContentScriptToAllTabs();
  }
});

