;(function() {
  'use strict';

  const api = window.View = {
    clickhandler(){}
  }

  //воспользуемся встроенным методом Intl и его методом NumberFormat (форматором), чтобы выводить стоимость с пробелами для читаемости
  const {format} = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumSignificantDigits: 1
  })

  //отображаем 1 карточку
  api.getFlatCardElement = function getFlatCardElement(data){
    const rootElement = document.createElement('div')
    rootElement.innerHTML = cardTemplate.replace(/%ID%/, data.id)
                                        .replace(/%IMG%/, data.img)
                                        .replace(/%LABEL%/, data.label)
                                        .replace(/%ROOMS%/, data.rooms)
                                        .replace(/%SQUARE%/, data.square)
                                        .replace(/%PRICE%/, format(data.price))
                                        .replace(/%PRICE-PER-METER%/, format(Math.ceil(data.price / data.square)))
                                        .replace(/%code%/, data.code)
                                        .replace(/%FLOOR%/, data.floor)
                                        .replace(/%FLOORSHOUSE%/, data.floorsHouse)
                                        .replace(/%LIKE_CLASS%/, data.like ? 'red' : '')

    //отслеживаем событие клик по сердечку и отдаем id карточки где кликнули
    const likeElement = rootElement.querySelector('.card__like')
    likeElement.addEventListener('click', function(){
      const flatId = data.id
      api.clickhandler(flatId)
    })

    return rootElement.firstElementChild
  }

  //отображаем блок с карточками
  api.getShowcaseElement = function getShowcaseElement(data){
    const cardWrapperElement = document.createElement('div')
    cardWrapperElement.classList.add('cards-wrapper')

    const contaiterElement = document.createElement('div')
    contaiterElement.className = 'container p-0'

    cardWrapperElement.append(contaiterElement)

    const rowElement = document.createElement('div')
    rowElement.classList.add('row')

    for(let i = 0; i < data.length; i+=4) {
      for(let j = i; j < data.length && j < i+4; j++) {
        const colElement = document.createElement('div')
        colElement.classList.add('col-md-4')
        colElement.append(View.getFlatCardElement(data[j]))
        rowElement.append(colElement)
      }
    }
    contaiterElement.append(rowElement)

    return cardWrapperElement
  }

  //генерируем содержимое select
  api.generateLabelFilter = function generateLabelFilter(flats){
    const selectElement = document.createElement('select')
    const optionDefaultElement = document.createElement('option')
    optionDefaultElement.setAttribute('value', '')
    optionDefaultElement.textContent = 'Все проекты'
    selectElement.append(optionDefaultElement)

    //вытаскиваем только эл-ты label. потом фильтруем по уникальности
    flats = flats.map(x => x.label).filter((value, index, list) => index === list.lastIndexOf(value)) 

    for(const flat of flats) {
      const optionElement = document.createElement('option')
      optionElement.setAttribute('value', flat)
      optionElement.textContent = flat
      selectElement.append(optionElement)
    }

    return selectElement
  }

  //создаем 1 панельку
  api.getFlatPanelElement = function getFlatPanelElement(data) {
    const rootElement = document.createElement('div')
    rootElement.innerHTML = panelTemplate.replace(/%ID%/, data.id)
                                         .replace(/%LABEL%/, data.label)
                                         .replace(/%ROOMS%/, data.rooms)
                                         .replace(/%SQUARE%/, data.square)
                                         .replace(/%PRICE%/, format(data.price))
                                         .replace(/%PRICE-PER-METER%/, format(Math.ceil(data.price / data.square)))
                                         .replace(/%code%/, data.code)
                                         .replace(/%FLOOR%/, data.floor)
                                         .replace(/%FLOORSHOUSE%/, data.floorsHouse)
                                         .replace(/%LIKE_CLASS%/, data.like ? 'red' : '')

    //отслеживаем событие клик по сердечку и отдаем id карточки где кликнули
    const likeElement = rootElement.querySelector('.panel__favourite-btn')
    likeElement.addEventListener('click', function(){
      const flatId = data.id
      api.clickhandler(flatId)
    })

    return rootElement.firstElementChild
  }

  //создаем блок с панельками
  api.getListcaseElement = function getListcaseElement(data){
    const listcaseElement = document.querySelector('[data-listcase]')
    
    for(let i = 0; i < data.length; i++) {
      const panelElement = View.getFlatPanelElement(data[i])
      listcaseElement.append(panelElement)
    }
    return listcaseElement
  }

  //заполняем информацию в карточке квартиры
  api.updateFlatCard = function updateFlatCard(dom, flat){

    const roomsElements = dom.querySelectorAll('[data-flat-rooms]')
    for(const item of roomsElements) {
      switch(flat.rooms) {
        case 1 :
          item.textContent = 'Студия, '
          break
        case 2 :
          item.textContent = '2 комнаты, '
          break
        case 3 :
          item.textContent = '3 комнаты, '
          break
        case 4 :
          item.textContent = '4 комнаты, '
          break
      }
    }

    const squareElements =  dom.querySelectorAll('[data-flat-square]')
    for(const item of squareElements){
      item.textContent = flat.square
    }

    const priceElements = dom.querySelectorAll('[data-flat-price]')
    for(const item of priceElements) {
      item.textContent = format(flat.price)
    }
    
    dom.querySelector('[data-flat-label]').textContent = flat.label
    dom.querySelector('[data-flat-price-per-meter]').textContent = format(Math.ceil(flat.price / flat.square)) + '/м2'
    dom.querySelector('[data-flat-floor]').textContent = flat.floor

  }

  const cardTemplate = `
<div class="card">
  <div class="card__header">
    <a class="card__title" href="/object.html?id=%ID%">%LABEL%</a>
    <div class="card__like">
      <i class="fas fa-heart %LIKE_CLASS%"></i>
    </div>
  </div>
  <div class="card__img">
    <img src="img/%IMG%" alt="План квартиры">
  </div>
  <div class="card__desc">
    <div class="card__price">
      <div class="card__price-total">%PRICE%</div>
      <div class="card__price-per-meter">%PRICE-PER-METER%/м2</div>
    </div>

    <!-- card__params params -->
    <div class="card__params params">
      <div class="params__item">
        <div class="params__definition">Комнат</div>
        <div class="params__value">%ROOMS%</div>
      </div>
      <div class="params__item">
        <div class="params__definition">Площадь</div>
        <div class="params__value">%SQUARE%</div>
      </div>
    </div>
    <!-- //card__params params -->

  </div>
  <div class="card__footer">
    <div class="card__art">%code%</div>
    <div class="card__floor">Этаж %FLOOR% из %FLOORSHOUSE%</div>
  </div>
</div>`

  const panelTemplate = `
<div class="panel">
  <div class="panel__artikul">%code%</div>
  <div class="panel__name">
    <a href="/object.html?id=%ID%">%LABEL%</a>
  </div>
  <div class="panel__block">%FLOORSHOUSE%</div>
  <div class="panel__floor">%FLOOR%</div>
  <div class="panel__rooms">%ROOMS%</div>
  <div class="panel__sq">%SQUARE% м2</div>
  <div class="panel__price-per-m">%PRICE-PER-METER%</div>
  <div class="panel__price">%PRICE%</div>
  <div class="panel__seller">Застройщик</div>
  <div class="panel__favourite">
    <button class="panel__favourite-btn">
      <i class="fas fa-heart %LIKE_CLASS%"></i>
    </button>
  </div>
</div>`

})();