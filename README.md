# Домашнее задания для Школы разработки интерфейсов - 2018 II

## Демо
Онлайн демонстрация

ДЗ #1 [https://rinagorsha.github.io/shri-2018-homework/hw1](https://rinagorsha.github.io/shri-2018-homework/hw1)

ДЗ #2 [https://rinagorsha.github.io/shri-2018-homework/hw1](https://rinagorsha.github.io/shri-2018-homework/hw1)

ДЗ #3 [http://rinagorsha.rccraft.ru/shri-2018-2/hw3/video-monitoring.html](http://rinagorsha.rccraft.ru/shri-2018-2/hw3/video-monitoring.html)

## Установка
Необходим
* [nodejs](https://nodejs.org/) версии 10 и выше
* [npm](https://www.npmjs.com/) версии 6 и выше
* или [yarn](https://yarnpkg.com/) версии 1.10 и выше

```
$ npm install
```

#### Локальный сервер
```
$ npm run start
```

#### Билд
Итоговый билд будет лежать в папке `dist`
```
$ npm run compile
```

## Комментарии к ДЗ #1 «Адаптивная вёрстка»
[Онлайн демо](https://rinagorsha.github.io/shri-2018-homework/hw1)

Верстка адаптивная (responsive): страница корректно отображается на экранах любых размеров.
Брейкпойнты для медиа-запросов были выбраны как что-то среднее между размерами экранов популярных устройств и размеров, когда адаптивный макет начинал выглядеть некорректно.

Данные для карточек берутся из лежащего в корне `events.json`. На лету данные не подставляются, нужно перезапусить сборку.

Карточка с камерой интерактивная:
* Движение пальцем позволяет перемещаться по картинке
* Pinch позволяет приближать и оттдалять картинку
* Поворот позволяет менять яркость изображения

Карточка с камерой имеет адаптивное изображение: для десктопных устройств отображается крупное изображение, для мобильных - поменьше.

#### Использованные технологии
* В качестве шаблонизатора использовался pug, в качестве css-препроцессора — stylus, позволяющие писать меньше кода, чем ванильные css и html.
* Autoprefixer для кросс-браузерности.

## Комментарии к ДЗ #2 «Работа с сенсорным пользовательским вводом»
### Выполненные пункты задания:
- [x] Движение пальцем влево-вправо позволяет перемещаться по картинке - поворот камеры
- [x] Pinch позволяет приблизить или отдалить картинку
- [x] Поворот изменяет яркость изображения
- [x] Обзор на 360 градусов с помощью Pointer Lock API
- [x] Отображать на карточке текущий статус камеры: масштаб и яркость

## Комментарии к ДЗ #3 «Мультимедиа»
[Онлайн демо](http://rinagorsha.rccraft.ru/shri-2018-2/hw3/video-monitoring.html)

Сайт должен открываться по http ссылке, а не по https. Если происходит редирект на https-версию сайта, то попробуйте открыть эту ссылку в режиме инкогнито.

Для запуска потребуется склонировать [репозиторий](https://github.com/mad-gooze/shri-2018-2-multimedia-homework) с видеопотоками и запустить в нем
```
$ npm install
$ npm start
```

В папке с текущим репозиторием запустить 
```
$ npm install
$ npm run serve
```

Страница находится по ссылке [localhost:8080/video-monitoring.html](http://localhost:8080/video-monitoring.html) или по ссылке "Видеонаблюдение" в шапке сайта.

Работа отлаживалась в Chrome на десктопе и в Chrome наAndroid.

### Выполненные пункты задания:
- [x] На странице находится сетка из 4-х видео-превью. Клик по превью разворачивает соответствующее видео на всю страницу.
- [x] Анимация разворачивания видео сделана по аналогии с приложением Photo Booth [пример анимации](https://yadi.sk/i/shdHcVlkd_BO1w]).
- [x] Когда видео раскрыто на всю страницу, появляется кнопка "Все камеры".
- [x] На экран просмотра видео добавлена возможность регулировать его яркость и контрастность.
- [x] Реализован анализатор громкости звука в потоке из открытой камеры (в виде столбчатой диаграммы).
- [x] Добавлена информация об уровне освещенности в комнате, в которой стоит камера.
- [x] Реализовать детектор движения в видео-потоке.

### Реализация
- Анимация сделана через transform: scale() и transform-origin
- Регулировка яркости и контрастности реализована через css-filter. Реализация через canvas оказалась непроизводительна.
- Анализатор громкости звука сделан AudioContext.createAnalyser() и визуализирован через canvas.
- Уровень освещенности посчитан по формуле яркости цвета каждого пикселя в canvas https://www.w3.org/TR/AERT/#color-contrast
Реализация детектора движения:
  - Взят видео-поток в canvas (из расчета освещенности)
  - Текущий кадр попиксельно сравнивается с предыдущим (каждые 50мс)
  - Если для пикселя разница, больше, чем на threshold, пиксель в отдельной canvas закрашивается белым, иначе -- черным
  - После закрашивания проходим по черно-белой canvas чанками
  - Если в чанке процент содержания белого больше, чем threshold, в этом чанке есть движение
  - По минимальным и максимальным x и У на отдельной canvas рисуется прямоугольник
- Для оптимизации расчета уровня освещенности, анализа громкости звука и детектора движения был использован setInterval, а не requestAnimationFrame. Это позволяет снизить количество просчетов в секунду при умеренном снижении плавности.

## Комментарии к ДЗ #4 «Node js»
Запуск сервера
```
$ npm install
$ npm run server
```

Сервер доступен по ссылке [localhost:8000/](http://localhost:8000/)

Выполненные пункты задания:
Написать сервер на express который будет подниматься на 8000 порту и обрабатывать два роута
- [x] /status — должен выдавать время, прошедшее с запуска сервера в формате hh:mm:ss
- [x] /api/events — должен отдавать содержимое файла events.json
- [x] При передаче get-параметра type включается фильтрация по типам событий. Возможна фильтрация по нескольким типам событий, пока все типы валидны (/api/events?type=info:critical)
- [x] При передаче некорректного type — отдавать статус 400 "incorrect type"
- [x] Все остальные роуты должны отдавать `<h1>Page not found</h1>`, с корректным статусом 404
- [ ] Подключить данные к вёрстке из первого задания


## Задание

### ДЗ #1 «Адаптивная вёрстка»
[Ссылка на макет](https://shri-msk-2018-reviewer.github.io/shri-18-smarthouse-task-1/)

Нужно сверстать страницу ленты событий умного дома.
Предоставляется базовый дизайн ленты для экрана. Изменения размеров и компоновки карточек на других размерах экрана необходимо придумать и реализовать самостоятельно. Верстка должна быть максимально адаптивной.

### ДЗ #2 «Работа с сенсорным пользовательским вводом»
В одной из карточек реализовать управление камерой умного дома.


### ДЗ #3 
[Задание](https://github.com/mad-gooze/shri-2018-2-multimedia-homework)

В этом задании мы будем делать страницу видеонаблюдения в умном доме.
На странице можно смотреть HLS видеопотоки с веб-камер, переключать камеры, накладывать риал-таймовые фильтры на видео и следить за активностью в умном доме.

### ДЗ #4 
Написать сервер на express который будет подниматься на 8000 порту и обрабатывать два роута: /status и /api/events
