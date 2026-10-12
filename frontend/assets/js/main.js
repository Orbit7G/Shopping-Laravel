import { API, BASE_URL , getToken } from './api.js';

// Helper Function to get product image URL
function getProductImage(imagePath) {
    if (!imagePath) {
        return 'https://via.placeholder.com/500x350?text=No+Image';
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${BASE_URL}${imagePath}`;
}

// Helper Function to get stock badge
function getStockBadge(stock) {
    const stockCount = Number(stock) || 0;
    if (stockCount > 0) {
        return `<span class="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill small">${stockCount} Left in Stock</span>`;
    } else {
        return `<span class="badge bg-danger-subtle text-danger border border-danger px-2 py-1 rounded-pill small">Out of Stock</span>`;
    }
}

async function renderProducts() {
    const container = document.getElementById('products-container') || document.getElementById('list_products');
    const loadingElement = document.getElementById('loading');

    if (!container) return;

    try {
        const products = await API.getProducts();
        
        if (loadingElement) loadingElement.style.display = 'none';

        if (!products || products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-4"><p>لا توجد منتجات حالياً.</p></div>';
            return;
        }

        container.innerHTML = '';

        products.forEach(item => {
            const imgUrl = getProductImage(item.image_url || item.image);
            const stockBadge = getStockBadge(item.stock);

            container.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 product-card shadow-sm border-0">
                        <img src="${imgUrl}" class="card-img-top" alt="${item.name}" 
                             style="height: 250px; object-fit: contain;">
                        <div class="card-body text-center">
                            <h5 class="card-title fw-bold">${item.name}</h5>
                            <div class="mb-2">
                                ${stockBadge}
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="price-badge">${item.price} $</span>
                                <a href="product-details.html?id=${item.id}" class="btn btn-primary btn-sm">التفاصيل</a>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

    } catch (error) {
        if (loadingElement) {
            loadingElement.innerHTML = `<div class="alert alert-danger">فشل في تحميل المنتجات: ${error.message}</div>`;
        }
    }
}

// Render Product Detail
async function renderDetails() {
    const detailContainer = document.getElementById('product_info');
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        detailContainer.innerHTML = `<div class="alert alert-warning">لم يتم تحديد المنتج</div>`;
        return;
    }

    try {
        const product = await API.getProductDetail(productId);
        const imgUrl = getProductImage(product.image_url || product.image);
        const stockBadge = getStockBadge(product.stock);

        detailContainer.innerHTML = `
            <div class="row detail-container align-items-center bg-white p-4 rounded shadow-sm">
                <div class="col-md-6 text-center">
                    <img src="${imgUrl}" class="img-fluid rounded shadow" alt="${product.name}" 
                         style="max-height: 450px; width: 100%; object-fit: contain;">
                </div>
                <div class="col-md-6 px-lg-5">
                    <h1 class="fw-bold mb-3">${product.name}</h1>
                    <div class="mb-3">
                        ${stockBadge}
                    </div>
                    <p class="text-muted mb-4">${product.description || 'لا يوجد وصف للمنتج'}</p>
                    <h3 class="text-success fw-bold mb-4">${product.price} $</h3>
                    <div class="d-grid gap-2">
                        <a href="index.html" class="btn btn-outline-secondary">العودة للمتجر</a>
                    </div>
                </div>
            </div>`;
    } catch (error) {
        detailContainer.innerHTML = `<div class="alert alert-danger">لا يمكن العثور على المنتج: ${error.message}</div>`;
    }
}

async function handleRegister() {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
        };

        try {
            messageDiv.innerHTML = '<div class="alert alert-info">جاري معالجة الطلب...</div>';

            const result = await API.register(userData);

            messageDiv.innerHTML = '<div class="alert alert-success">تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة الدخول...</div>';

            setTimeout(() => {
                window.location.replace('index.html');
            }, 1500);

        } catch (error) {
            messageDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    });
}

function updateNavbar() {
    const authButtons = document.getElementById('auth-buttons');
    if (!authButtons) return;

    const token = getToken();
    const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
    const userAvatar = storage.getItem("userAvatar");
    const userName = storage.getItem("userName") || "المستخدم";

    if (token) {
        // تحديد مسار الصورة (إما صورة المستخدم المرفوعة أو صورة افتراضية)
        const avatarSrc = userAvatar 
            ? `${BASE_URL}/storage/${userAvatar}` 
            : 'https://via.placeholder.com/40?text=U';

        authButtons.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <!-- Avatar كـ رابط لصفحة Profile -->
                <a href="profile.html" class="text-decoration-none d-flex align-items-center gap-2" title="${userName}">
                    <img src="${avatarSrc}" 
                         alt="${userName}" 
                         class="rounded-circle border border-2 border-info shadow-sm" 
                         style="width: 40px; height: 40px; object-fit: cover; cursor: pointer;">
                </a>
                
                <!-- زر الخروج -->
                <button id="logoutBtn" class="btn btn-outline-danger btn-sm rounded-pill">تسجيل الخروج</button>
            </div>
        `;

        // ربط حدث زر الخروج
        document.getElementById('logoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            await API.logout();
            window.location.replace('index.html');
        });
    } else {
        // في حال عدم وجود توكن
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-outline-light btn-sm">Login</a>
            <a href="Register.html" class="btn btn-primary btn-sm">Sign Up</a>
        `;
    }
}


// ===== معالجة نموذج تسجيل الدخول =====
async function handleLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const credentials = {
            email: document.getElementById('login_email').value,
            password: document.getElementById('login_password').value,
        };

        const rememberMe = document.getElementById('rememberMe').checked;

        try {
            loginMessage.innerHTML = '<div class="alert alert-info">جاري تسجيل الدخول...</div>';

            // استقبال الاستجابة في المتغير result
            const result = await API.login(credentials, rememberMe);

            loginMessage.innerHTML = '<div class="alert alert-success">تم تسجيل الدخول بنجاح! جاري التوجيه...</div>';

            // تحديث الشريط العلوي والتوجيه
            setTimeout(() => {
                window.location.replace('index.html');
            }, 1000);

        } catch (error) {
            loginMessage.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    });
}

async function handleProfile() {
    const profileForm = document.getElementById('profileForm');
    const messageDiv = document.getElementById('profileMessage');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');

    if (!profileForm) return;

    // 1. جلب البيانات وتعبئتها بالمدخلات
    try {
        const user = await API.getProfile();
        document.getElementById('prof_name').value = user.name || '';
        document.getElementById('prof_email').value = user.email || '';
        document.getElementById('prof_phone').value = user.phone || '';

        if (user.avatar) {
            avatarPreview.src = `${BASE_URL}/storage/${user.avatar}`;
        }
    } catch (error) {
        window.location.replace('login.html'); // تحويل للدخول إذا كان التوكن منتهي
        return;
    }

    // 2. معاينة الصورة فور اختيارها
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            avatarPreview.src = URL.createObjectURL(file);
        }
    });

    // 3. إرسال النموذج وحفظ التغييرات
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('prof_name').value);
        formData.append('email', document.getElementById('prof_email').value);
        formData.append('phone', document.getElementById('prof_phone').value);

        if (avatarInput.files[0]) {
            formData.append('avatar', avatarInput.files[0]);
        }

        try {
            messageDiv.innerHTML = '<div class="alert alert-info">جاري الحفظ...</div>';

            const result = await API.updateProfile(formData);

            // تحديث الاسم في التخزين المحلي
            const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
            storage.setItem("userName", result.user.name);

            if (result.user.avatar) {
                storage.setItem("userAvatar", result.user.avatar);
                }
                
            messageDiv.innerHTML = '<div class="alert alert-success">تم تحديث البيانات بنجاح!</div>';
            updateNavbar(); // إعادة تحديث اسم المستخدم بالشريط علوياً

        } catch (error) {
            messageDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    });
}

// تشغيل الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();

    if (document.getElementById('list_products') || document.getElementById('products-container')) {
        renderProducts();
    }

    if (document.getElementById('product_info')) {
        renderDetails();
    }

    if (document.getElementById('registerForm')) {
        handleRegister();
    }

    if (document.getElementById('loginForm')) {
        handleLogin();
    }

    if (document.getElementById('profileForm')) {
        handleProfile();
    }
});