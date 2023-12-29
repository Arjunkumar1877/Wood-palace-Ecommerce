# Zoomsl

Бесплатный jQuery плагин зуммирования изображения с эффектом лупы.

- Поддержка всех современных браузеров
- Плавность анимации в браузере IE8
- Простота организация галереи
- Расширенный функционал с возможностью тонкой настройки
- Возможность задавать свои css классы для изменения внешнего вида

Поддерживаемые браузеры - FF2+ IE8+ Opr9+ Chr1+ Saf2+

Для стабильной работы плагина рекомендуется использовать jQuery 3 версии.

---
Автор: Сергей Зарагулов

Сайт плагина: http://zoomsl.sergeland.ru/

Документация: http://zoomsl.sergeland.ru/help/

Демо: http://zoomsl.sergeland.ru/example/

---

## Быстрый старт

```
<body>
    <img class="my-foto" src="/images/image1-small.jpg"  data-large="/images/image1-big.jpg" title="Фото1">
    <img class="my-foto" src="/images/image2-small.jpg"  data-large="/images/image2-big.jpg" title="Фото2">
    <img class="my-foto" src="/images/image3-small.jpg"  data-large="/images/image3-big.jpg" title="Фото3">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.0/jquery.min.js></script>
    <script src="zoomsl.js"></script>

    <script>
        $(document).ready(function () {
            $(".my-foto").imagezoomsl();
        });
    </script>
</body>
```