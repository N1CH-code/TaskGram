import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    { name: 'Дизайн', slug: 'design', icon: '🎨', children: ['Графический дизайн', 'Веб-дизайн', 'UI/UX', 'Логотипы'] },
    { name: 'Разработка', slug: 'development', icon: '💻', children: ['Telegram-боты', 'Веб-сайты', 'Мобильные приложения', 'Python', 'JavaScript'] },
    { name: 'Маркетинг', slug: 'marketing', icon: '📊', children: ['SMM', 'Контекстная реклама', 'SEO', 'Email-маркетинг'] },
    { name: 'Wildberries', slug: 'wildberries', icon: '📦', children: ['Карточки товаров', 'Инфографика', 'Оптимизация'] },
    { name: 'Ozon', slug: 'ozon', icon: '📦', children: ['Карточки товаров', 'Инфографика', 'Оптимизация'] },
    { name: 'Фото', slug: 'photo', icon: '📷', children: ['Обработка фото', 'Предметная съёмка', 'Ретушь'] },
    { name: 'Видео', slug: 'video', icon: '🎬', children: ['Монтаж', 'Motion-дизайн', 'Озвучка'] },
    { name: 'Тексты', slug: 'text', icon: '✍️', children: ['Копирайтинг', 'Рерайтинг', 'Переводы'] },
    { name: 'Бухгалтерия', slug: 'accounting', icon: '📒', children: ['Расчёты', 'Отчётность', 'Налоги'] },
    { name: 'Обучение', slug: 'education', icon: '📚', children: ['Репетиторство', 'Курсы', 'Консультации'] },
    { name: 'Вышивка', slug: 'embroidery', icon: '🧵', children: ['Создание файлов', 'Дизайн схем', 'Превью'] },
    { name: 'Конструирование одежды', slug: 'clothing', icon: '👗', children: ['Лекала', 'Моделирование', 'Технические рисунки'] },
    { name: 'CLO3D', slug: 'clo3d', icon: '👔', children: ['3D-моделирование', 'Рендеры', 'Анимация'] },
    { name: 'Другое', slug: 'other', icon: '📌', children: [] },
  ];

  for (const cat of categories) {
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });

    for (const childName of cat.children) {
      await prisma.category.create({
        data: {
          name: childName,
          slug: `${cat.slug}-${childName.toLowerCase().replace(/[^a-zа-яё0-9]/g, '-')}`,
          icon: cat.icon,
          parentId: parent.id,
        },
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
