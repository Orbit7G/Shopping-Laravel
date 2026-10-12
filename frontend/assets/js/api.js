export const BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = `${BASE_URL}/api`;

export function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");}

export const API = {
    // List Products
    async getProducts() {
        const response = await fetch(`${API_BASE_URL}/Home`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error('فشل في جلب القائمة');
        return data.data || data;
    },

    // Show Product Details
    async getProductDetail(id) {
        const response = await fetch(`${API_BASE_URL}/product/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error('المنتج غير موجود');
        return data.data || data;
    },

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            // إظهار أول رسالة خطأ قادمة من Validation الخاص بـ Laravel
            if (data.errors) {
                const firstError = Object.values(data.errors)[0][0];
                throw new Error(firstError);
            }
            throw new Error(data.message || 'فشل عملية التسجيل');
        }
        return data;
    },

    async login(credentials, remember) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
    }

    // تحديد مكان التخزين
    const storage = remember ? localStorage : sessionStorage;

    // تنظيف التخزين القديم لمنع التضارب
    localStorage.clear();
    sessionStorage.clear();

    // حفظ البيانات بشكل صريح
    storage.setItem("token", data.token);
    if (data.user) {
        storage.setItem("userName", data.user.name || "المستخدم");
        if (data.user.avatar) {
            storage.setItem("userAvatar", data.user.avatar);
        }
    }

    return data;
},

    // ===== Logout Function =====
    async logout() {
        const token = getToken();

        try {
            if (token) {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (err) {
            console.warn("تعذر إبلاغ السيرفر بتسجيل الخروج", err);
        } finally {
            // مسح التوكن نهائياً من المتصفح في جميع الحالات
            localStorage.clear();
            sessionStorage.clear();
        }
    },

    async getProfile() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل جلب البيانات');
    return data;
},

// تحديث البروفايل (باستخدام FormData لدعم رفع الصورة)
async updateProfile(formData) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
            // ملاحظة: لا نضع Content-Type هنا لأن المتصفح يحدده تلقائياً مع Multipart
        },
        body: formData
    });
    const data = await response.json();
    if (!response.ok) {
        if (data.errors) {
            const firstError = Object.values(data.errors)[0][0];
            throw new Error(firstError);
        }
        throw new Error(data.message || 'فشل تحديث البيانات');
    }
    return data;
},
};