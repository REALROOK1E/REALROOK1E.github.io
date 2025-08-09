/**
 * MyTodo Landing Page JavaScript
 * 着陆页交互功能和动画效果
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // 平滑滚动导航
    // ================================
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ================================
    // 滚动时的导航栏效果
    // ================================
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 添加背景模糊效果
        if (scrollTop > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(12px)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(12px)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // ================================
    // 滚动动画效果
    // ================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animateElements = document.querySelectorAll(
        '.feature-card, .stat-item, .step, .philosophy-item, .download-btn'
    );
    
    animateElements.forEach(el => observer.observe(el));
    
    // ================================
    // App 预览窗口的交互效果
    // ================================
    const appPreview = document.querySelector('.app-preview');
    if (appPreview) {
        appPreview.addEventListener('mouseenter', function() {
            this.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)';
        });
        
        appPreview.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1)';
        });
    }
    
    // ================================
    // 任务项目的动画效果
    // ================================
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach((task, index) => {
        setTimeout(() => {
            task.style.opacity = '1';
            task.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // ================================
    // 进度条动画
    // ================================
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const targetWidth = progressBar.style.width;
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.width = targetWidth;
        }, 1000);
    }
    
    // ================================
    // 运行中计时器的模拟动画
    // ================================
    const runningTimer = document.querySelector('.task-timer.running');
    if (runningTimer) {
        let seconds = 23 * 60 + 15; // 23:15 转换为秒数
        
        setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            
            const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            runningTimer.textContent = timeString;
        }, 1000);
    }
    
    // ================================
    // 统计数字的计数动画
    // ================================
    function animateNumber(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target > 10) {
                element.textContent = Math.floor(current);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
    
    // 当统计数字进入视口时触发动画
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const text = target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                
                if (number > 0) {
                    animateNumber(target, number);
                }
                
                statObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => statObserver.observe(stat));
    
    // ================================
    // 下载按钮功能
    // ================================
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.getAttribute('data-platform');
            
            // 这里可以添加实际的下载逻辑
            // 目前只是显示提示信息
            showNotification(`正在准备 ${platform} 版本的下载...`, 'info');
            
            // 模拟下载准备过程
            setTimeout(() => {
                showNotification(`${platform} 版本下载已开始！`, 'success');
            }, 1500);
        });
    });
    
    // ================================
    // 通知系统
    // ================================
    function showNotification(message, type = 'info') {
        // 创建通知容器（如果不存在）
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            `;
            document.body.appendChild(container);
        }
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 10px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 320px;
            font-size: 14px;
            color: #374151;
        `;
        
        notification.textContent = message;
        container.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ================================
    // 键盘快捷键
    // ================================
    document.addEventListener('keydown', function(e) {
        // ESC 键返回顶部
        if (e.key === 'Escape') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // 空格键暂停/继续滚动动画
        if (e.key === ' ' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            // 这里可以添加暂停动画的逻辑
        }
    });
    
    // ================================
    // 移动端触摸优化
    // ================================
    if ('ontouchstart' in window) {
        // 为移动端优化触摸体验
        const touchElements = document.querySelectorAll('.btn, .download-btn, .feature-card');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
    
    // ================================
    // 性能优化：防抖滚动事件
    // ================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 应用防抖到滚动事件
    const debouncedScrollHandler = debounce(function() {
        // 这里可以添加需要防抖的滚动处理逻辑
    }, 100);
    
    window.addEventListener('scroll', debouncedScrollHandler);
    
    // ================================
    // 页面加载完成后的初始化
    // ================================
    console.log('🎉 MyTodo Landing Page 已加载完成');
    console.log('💡 体验更好的时间管理方式');
    
    // 添加页面可见性API支持
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面隐藏时暂停动画
            document.body.style.animationPlayState = 'paused';
        } else {
            // 页面可见时恢复动画
            document.body.style.animationPlayState = 'running';
        }
    });
    
    // ================================
    // 错误处理
    // ================================
    window.addEventListener('error', function(e) {
        console.error('页面错误:', e.error);
        // 可以在这里添加错误报告逻辑
    });
    
    // ================================
    // 预加载关键资源
    // ================================
    function preloadImages() {
        const imageUrls = [
            './assets/icon.png'
            // 添加其他需要预加载的图片
        ];
        
        imageUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }
    
    preloadImages();
});

// ================================
// 工具函数
// ================================

/**
 * 检测用户设备类型
 */
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|ios|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    
    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet
    };
}

/**
 * 获取用户首选的操作系统
 */
function getPreferredOS() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'windows';
    if (userAgent.includes('Mac')) return 'macos';
    if (userAgent.includes('Linux')) return 'linux';
    
    return 'windows'; // 默认
}

/**
 * 格式化时间显示
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 检查浏览器支持的功能
 */
function checkBrowserSupport() {
    const support = {
        css: {
            grid: CSS.supports('display: grid'),
            flexbox: CSS.supports('display: flex'),
            backdrop: CSS.supports('backdrop-filter: blur(10px)')
        },
        js: {
            es6: typeof Symbol !== 'undefined',
            asyncAwait: typeof (async function() {}) === 'function',
            intersectionObserver: 'IntersectionObserver' in window
        }
    };
    
    return support;
}

// 在控制台显示浏览器支持信息（开发时使用）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 浏览器支持检查:', checkBrowserSupport());
    console.log('📱 设备检测:', detectDevice());
    console.log('💻 首选操作系统:', getPreferredOS());
}
