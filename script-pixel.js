// Language Manager - Handles Chinese/English translations
class LanguageManager {
    constructor() {
        this.currentLang = 'en'; // Default to English
        this.translations = {
            // Game-specific translations
            'moonwalker': {
                en: 'Moon Walker',
                zh: '月球漫步者'
            },
            'iwbtg': {
                en: 'I Wanna Be The Guy',
                zh: '我想成为那个家伙'
            }
        };
        
        this.init();
    }

    init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('portfolio-lang');
        if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
            this.currentLang = savedLang;
        } else {
            // Default to Chinese, but can be overridden by browser detection
            const browserLang = navigator.language || navigator.userLanguage;
            this.currentLang = browserLang.startsWith('en') ? 'en' : 'zh';
        }

        // Set initial language
        this.updateLanguage(this.currentLang);
        
        // Setup language toggle button
        this.setupLanguageToggle();
        
        console.log(`🌐 Language Manager initialized with: ${this.currentLang}`);
    }

    setupLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const newLang = this.currentLang === 'en' ? 'zh' : 'en';
                this.switchLanguage(newLang);
                
                // Add visual feedback
                langToggle.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    langToggle.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }

    switchLanguage(newLang) {
        if (newLang !== this.currentLang) {
            this.updateLanguage(newLang);
            this.currentLang = newLang;
            localStorage.setItem('portfolio-lang', newLang);
            
            // Update button text
            this.updateToggleButton();
            
            console.log(`🌐 Language switched to: ${newLang}`);
        }
    }

    updateLanguage(lang) {
        // Update all elements with data attributes
        const elements = document.querySelectorAll('[data-en][data-zh]');
        elements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update select options
        const selectOptions = document.querySelectorAll('option[data-en][data-zh]');
        selectOptions.forEach(option => {
            const translation = option.getAttribute(`data-${lang}`);
            if (translation) {
                option.textContent = translation;
            }
        });

        // Update button texts
        const buttons = document.querySelectorAll('button[data-en][data-zh]');
        buttons.forEach(button => {
            const translation = button.getAttribute(`data-${lang}`);
            if (translation) {
                button.textContent = translation;
            }
        });

        // Update document title and meta description
        this.updateMetaContent(lang);
    }

    updateToggleButton() {
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            const langText = langToggle.querySelector('.lang-text');
            if (langText) {
                const newText = this.currentLang === 'en' ? '中文' : 'EN';
                langText.textContent = newText;
            }
        }
    }

    updateMetaContent(lang) {
        // Update page title
        const titles = {
            en: 'REALROOK1E - Pixel Adventure Portfolio',
            zh: 'REALROOK1E - 像素冒险作品集'
        };
        if (titles[lang]) {
            document.title = titles[lang];
        }

        // Update meta description
        const descriptions = {
            en: "REALROOK1E's pixel-style gaming portfolio - Explore my programming adventure journey",
            zh: "REALROOK1E的像素风格游戏作品集 - 探索我的编程冒险之旅"
        };
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && descriptions[lang]) {
            metaDesc.setAttribute('content', descriptions[lang]);
        }

        // Update meta keywords
        const keywords = {
            en: 'pixel style,gaming,personal website,programmer,portfolio,REALROOK1E',
            zh: '像素风格,游戏,个人网站,程序员,作品集,REALROOK1E'
        };
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && keywords[lang]) {
            metaKeywords.setAttribute('content', keywords[lang]);
        }
    }

    getText(key, fallback = '') {
        return this.translations[key]?.[this.currentLang] || fallback;
    }

    getCurrentLang() {
        return this.currentLang;
    }
}

// Initialize Language Manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Language Manager
    window.languageManager = new LanguageManager();
    
    console.log('🎮 Portfolio initialized with language support!');
    console.log('Available languages: English, Chinese');
    console.log('Use the language toggle button to switch languages!');
});

// Export for global access
window.LanguageManager = LanguageManager;
