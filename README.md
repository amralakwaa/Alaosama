<div dir="rtl">

# أمانات ومكتبة أسامة | Project Orion

**منصة مكتبة رقمية عربية:** كتب ومؤلفون وتصنيفات ومراجعات، وطلبات نشر للمؤلفين، وبحث، ومساعد ذكاء اصطناعي، مع لوحة إدارة.

</div>

---

## ماذا يحتوي المشروع؟ | What's inside

<div dir="rtl">

### الواجهة (Next.js)
- صفحات الكتب والمؤلفين والتصنيفات، والبحث، والخدمات.
- تسجيل حساب ودخول وملف شخصي ولوحة للمستخدم.
- **مسار النشر:** يقدّم المؤلف طلب نشر ويتابع حالته.
- لوحة إدارة، وخريطة موقع و`robots` و`manifest` يولّدها Next.js.

### الخادم (NestJS)
وحدات منفصلة لكل مجال: `auth` و`users` و`books` و`authors` و`categories` و`reviews` و`publishing-requests` و`notifications` و`upload` و`ai` و`admin` و`settings` و`services` و`health`.

### البنية
- `docker-compose.yml` يشغّل MySQL وRedis وAdminer للتطوير المحلي.

</div>

## التقنيات | Tech stack

| | |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | NestJS 11, TypeORM, TypeScript |
| Data | MySQL, Redis |
| Dev infra | Docker Compose |

## التشغيل محلياً | Local setup

```bash
git clone https://github.com/amralakwaa/Alaosama.git
cd Alaosama
docker-compose up -d

cd backend
npm install
npm run start:dev

cd ../frontend
npm install
npm run dev
```

<div dir="rtl">

الخادم على `http://localhost:3000/api/health`، والواجهة على `http://localhost:3001`. بيانات قاعدة البيانات المحلية موجودة في `docker-compose.yml`.

---

## المطوّر | Developer

صمّم المنصة وطوّرها **عمر بلال الأكوع** ([@amralakwaa](https://github.com/amralakwaa)).

## الحقوق

جميع الحقوق محفوظة.

</div>
