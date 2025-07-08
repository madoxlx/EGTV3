# إعداد الموقع للإنتاج على خادم محلي

## متطلبات النظام
- Node.js 18+ 
- PostgreSQL 12+ أو الاتصال بـ Neon Database
- PM2 لإدارة العمليات

## خطوات التشغيل

### 1. تثبيت المكتبات
```bash
npm install
npm install -g pm2
```

### 2. إعداد متغيرات البيئة
أنشئ ملف `.env` في المجلد الرئيسي:
```env
NODE_ENV=production
DATABASE_URL=your_database_url_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
PORT=3000
```

### 3. بناء المشروع
```bash
npm run build
```

### 4. تشغيل قاعدة البيانات
```bash
npm run db:push
```

### 5. تشغيل الخادم بـ PM2
```bash
pm2 start npm --name "sahara-journeys" -- run start
pm2 save
pm2 startup
```

## التحكم في الخادم

### إيقاف الخادم
```bash
pm2 stop sahara-journeys
```

### إعادة تشغيل الخادم
```bash
pm2 restart sahara-journeys
```

### مراقبة الخادم
```bash
pm2 status
pm2 logs sahara-journeys
```

### إيقاف نهائي
```bash
pm2 delete sahara-journeys
```

## الوصول للموقع
- الموقع سيعمل على: `http://localhost:3000`
- للوصول من أجهزة أخرى في الشبكة: `http://[server-ip]:3000`

## ملاحظات مهمة
- تأكد من أن Port 3000 مفتوح في Firewall
- احتفظ بنسخة احتياطية من قاعدة البيانات
- يمكن تغيير Port في ملف .env