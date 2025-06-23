# نظام حماية الصفحات الإدارية - EgyptExpress

## نظرة عامة

تم تطوير نظام حماية شامل للصفحات الإدارية في تطبيق EgyptExpress لضمان أمان الوصول للموارد الإدارية.

## المكونات الرئيسية

### 1. AdminRoute Component
- **الموقع**: `client/src/lib/admin-route.tsx`
- **الوظيفة**: حماية المسارات الإدارية على مستوى التوجيه
- **الميزات**:
  - التحقق من وجود المستخدم
  - التحقق من دور المستخدم (admin)
  - إعادة التوجيه التلقائي لصفحة تسجيل الدخول
  - عرض شاشة تحميل أثناء التحقق

### 2. SessionGuard Component
- **الموقع**: `client/src/components/admin/SessionGuard.tsx`
- **الوظيفة**: حماية إضافية على مستوى المكونات
- **الميزات**:
  - التحقق من صحة الـ session
  - اختبار الاتصال بالسيرفر
  - عرض رسائل خطأ واضحة
  - تنظيف البيانات المحلية عند انتهاء الصلاحية

### 3. Server-side Middleware
- **الموقع**: `server/routes.ts` (isAdmin middleware)
- **الوظيفة**: حماية API endpoints
- **الميزات**:
  - التحقق من الـ session
  - التحقق من دور المستخدم
  - إرجاع رسائل خطأ واضحة
  - إزالة "temporary admin access"

### 4. Session Validation Endpoint
- **المسار**: `/api/session/validate`
- **الوظيفة**: التحقق من صحة الـ session
- **الاستجابة**:
  ```json
  {
    "valid": true,
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "email": "admin@example.com"
    }
  }
  ```

## كيفية العمل

### 1. عند الوصول لصفحة إدارية:
1. `AdminRoute` يتحقق من وجود المستخدم ودوره
2. إذا لم يكن المستخدم مسجل، يتم إعادة التوجيه لصفحة تسجيل الدخول
3. إذا كان المستخدم موجود لكن ليس admin، يتم إعادة التوجيه للصفحة الرئيسية

### 2. أثناء استخدام الصفحة الإدارية:
1. `SessionGuard` يتحقق من صحة الـ session بشكل دوري
2. إذا انتهت صلاحية الـ session، يتم عرض رسالة خطأ
3. يتم تنظيف البيانات المحلية وإعادة التوجيه لصفحة تسجيل الدخول

### 3. عند استدعاء API:
1. `isAdmin` middleware يتحقق من الـ session
2. إذا لم تكن الـ session صالحة، يتم إرجاع خطأ 401
3. إذا لم يكن المستخدم admin، يتم إرجاع خطأ 403

## إعدادات الـ Session

تم تحسين إعدادات الـ session في `server/index.ts`:

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET || 'sahara-journeys-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'sahara.sid',
  rolling: true,
}));
```

## الميزات الأمنية

1. **حماية من CSRF**: استخدام `sameSite: 'lax'`
2. **HttpOnly Cookies**: منع الوصول للـ cookies من JavaScript
3. **Secure Cookies**: في بيئة الإنتاج
4. **Session Rolling**: تمديد الـ session مع كل طلب
5. **Custom Session Name**: `sahara.sid` بدلاً من الاسم الافتراضي

## رسائل الخطأ

### للمستخدمين:
- "جلسة العمل منتهية الصلاحية. يرجى تسجيل الدخول مرة أخرى."
- "You do not have permission to access this resource"

### للمطورين (في السجلات):
- "❌ Admin access denied: No session found"
- "❌ Admin access denied: User role is 'user', not 'admin'"
- "✅ Admin check passed for user: admin (ID: 1)"

## الاستخدام

### إضافة حماية لصفحة إدارية جديدة:

```typescript
// في App.tsx
<AdminRoute path="/admin/new-page" component={NewAdminPage} />
```

### إضافة SessionGuard لمكون:

```typescript
import { SessionGuard } from "@/components/admin/SessionGuard";

function MyAdminComponent() {
  return (
    <SessionGuard>
      <div>محتوى إداري محمي</div>
    </SessionGuard>
  );
}
```

## الاختبار

### اختبار الـ session:
```bash
curl -X GET http://localhost:8080/api/session/validate
```

### اختبار الصفحات الإدارية:
1. الوصول لصفحة إدارية بدون تسجيل دخول
2. تسجيل دخول كـ user عادي ومحاولة الوصول لصفحة إدارية
3. تسجيل دخول كـ admin والوصول للصفحات الإدارية
4. اختبار انتهاء صلاحية الـ session

## ملاحظات مهمة

1. تم إزالة "temporary admin access" نهائياً
2. جميع الصفحات الإدارية محمية الآن
3. النظام يعمل بشكل تلقائي عند تشغيل التطبيق
4. يمكن تخصيص رسائل الخطأ حسب الحاجة 