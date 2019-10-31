;(function() {
  'use strict';

  const api = window.Controller = {}

  const filtersDefault = {
    label: null,
    rooms: null,
    sort: null,
    square: {
      min: null,
      max: null
    },
    price: {
      min: null,
      max: null
    }
  }

  const pagination = {      //для пагинации
    currentPage: 1,         //текущая
    flatInPage: 3,          //кол-во квартир на странице
    commonPage: 1           //всего страниц
  }

  const filters = JSON.parse(JSON.stringify(filtersDefault))

  //функция, которая будет возвращать true, если у нас есть хоть 1 фильтр
  const isFiltred = () => JSON.stringify(filters) !== JSON.stringify(filtersDefault)

  api.start = function start(){
    document.querySelector('[data-viewmode-showcase-button]').addEventListener('click', function(event){
      event.preventDefault()
      Model.setViewMode('showcase')
    })
    document.querySelector('[data-viewmode-listcase-button]').addEventListener('click', function(event){
      event.preventDefault()
      Model.setViewMode('listcase')
    })

    //фильтр по label
    document.querySelector('[data-filter-label]').addEventListener('change', function(event){
      if(this.value === '') {
        if(filters.label !== null) {  //поможет лишний раз не перезагружать стр-цу, если фильр не изменился
          filters.label = null
          update()
        }
        return
      }

      if(filters.label === this.value) {
        return
      }

      filters.label = this.value
      update()
    })

    //фильтр по rooms
    document.querySelector('[data-filter-rooms]').addEventListener('change', function(event){
      const number =parseInt(event.target.getAttribute('number'))

      event.target.nextElementSibling.classList.toggle('rooms__btn--active')       //подсветка кнопок с количеством квартир
      
      if(filters.rooms === null) {
        filters.rooms = [number]
      }
      else {
        if(filters.rooms.includes(number)) {
          const index = filters.rooms.indexOf(number)
          filters.rooms.splice(index, 1)
        }
        else {
          filters.rooms.push(number)
        }
      }

      if(!filters.rooms.length) {
        filters.rooms = null
      }

      return update()
    })

    //фильтр по square mix
    document.querySelector('[data-filter-square-min]').addEventListener('change', function(event){
      if(!this.value) {
        if(filters.square.min !== null) {
          filters.square.min = null
          update()
        }
        return
      }

      const number = parseInt(this.value)
      
      if(filters.square.min !== number) {
        filters.square.min = number
        update()
      }
    })

    //фильтр по square max
    document.querySelector('[data-filter-square-max]').addEventListener('change', function(event){
      if(!this.value) {
        if(filters.square.max !== null) {
          filters.square.max = null
          update()
        }
        return
      }

      const number = parseInt(this.value)
      
      if(filters.square.max !== number) {
        filters.square.max = number
        update()
      }
    })

    //фильтр по price max
    document.querySelector('[data-filter-price-max]').addEventListener('change', function(event){
      if(!this.value) {
        if(filters.price.max !== null) {
          filters.price.max = null
          update()
        }
        return
      }

      const number = parseInt(this.value)
      
      if(filters.price.max !== number) {
        filters.price.max = number
        update()
      }
    })

    //фильтр по price min
    document.querySelector('[data-filter-price-min]').addEventListener('change', function(event){
      if(!this.value) {
        if(filters.price.min !== null) {
          filters.price.min = null
          update()
        }
        return
      }

      const number = parseInt(this.value)
      
      if(filters.price.min !== number) {
        filters.price.min = number
        update()
      }
    })

    //сортировка
    document.querySelector('[data-sort]').addEventListener('change', function(event){
      if(!this.value) {
        if(filters.sort !== null) {
          filters.sort = null
          update()
        }
        return
      }
      else {
        if(filters.sort !== this.value) {
          filters.sort = this.value
          update()
        }
      }
    })

    //сбросить фильтры
    document.querySelector('[data-filter-reset]').addEventListener('click', function(event){
      Object.assign(filters, {
        label: null,
        rooms: null,
        sort: null,
        square: {
          min: null,
          max: null
        },
        price: {
          min: null,
          max: null
        }
      })

      //чтобы при сбросе фильтров в select отображалось "Все проекты"
      const options = document.querySelector('[data-filter-label]').children
      for(let option of options) {
        option.removeAttribute('selected')
        if(option.value === '') {
          option.setAttribute('selected','selected')
        }
      }

      //убираем подсветку у комнат
      document.querySelector('[data-filter-rooms]')
              .querySelectorAll('label')
              .forEach(element => element.classList.remove('rooms__btn--active'))

      //очищаем содержимое инпутов
      document.querySelector('[data-filter-square-min]').value = ''
      document.querySelector('[data-filter-square-max]').value = ''
      document.querySelector('[data-filter-price-min]').value = ''
      document.querySelector('[data-filter-price-max]').value = ''

      update()
    })

    //обработчик кнопок пагинации
    document.querySelector('[data-pagination]').addEventListener('click', function(event){
      const number = parseInt(event.target.textContent)
      
      event.preventDefault()

      if(number !== pagination.currentPage) {
        pagination.currentPage = number
        update()
      }

      if(event.target.textContent === 'Следующая') {
        console.log(pagination);
        console.log(pagination.commonPage);

        
        // pagination.currentPage = pagination.currentPage + 1
      }
      else if(event.target.textContent === 'Предыдущая') {
        console.log('Предыдущая');
      }
    })

  }

  Model.dispatch = update
  update()

  //запросим данные от сервера
  fetch('/database.json')
    .then(answer => answer.json())     //говорим преврати ответ в json
    .then(data => {
      const selectElement = View.generateLabelFilter(data)  //заполним коллекцию option из БД
      document.querySelector('[data-filter-label]').innerHTML = selectElement.innerHTML

      pagination.commonPage = Math.ceil(data.length / pagination.flatInPage) //сколько у нас будет страниц
      pagination.currentPage = 1

      Model.setData(data)              //говорим каким образом хотим обработать эти данные.в нашем случае отправляем в Model
    })

  function update(){
    const originalData = Model.getFlats()
    const data = applyFilterAndSort(originalData)
    const viewMode = Model.getViewMode()

    const showcasePlace = document.querySelector('[data-viewmode-showcase]')
    const listcasePlace = document.querySelector('[data-viewmode-listcase]')
    const showcaseButton = document.querySelector('[data-viewmode-showcase-button]')
    const listcaseButton =document.querySelector('[data-viewmode-listcase-button]')

    showcaseButton.classList.remove('view-options__type-item--active')
    listcaseButton.classList.remove('view-options__type-item--active')
    
    showcasePlace.style.display = 'none'
    listcasePlace.style.display = 'none'

    
    if(viewMode === 'showcase') {
      showcaseButton.classList.add('view-options__type-item--active')
      showcasePlace.style.display = ''

      const showcaseElement =  View.getShowcaseElement(data)
      showcasePlace.innerHTML = ''
      showcasePlace.append(showcaseElement)
    }
    else {
      listcaseButton.classList.add('view-options__type-item--active') /* повесили активный класс на иконку списка */
      listcasePlace.style.display = ''                                /* отобразили блок со списком */

      const listcaseElement = document.querySelector('[data-listcase]')
      listcaseElement.innerHTML = ''
      
      View.getListcaseElement(data)
    }

    //если выбраны фильтры, показываем панель с количеством найденных квартир и сброс фильтров
    document.querySelector('[data-show-if-filter]').style.display = isFiltred() ? '' : 'none'
  }

  //функция, кот будет применять фильтры и сортировку
  function applyFilterAndSort(flats){
    if(filters.label) {
      flats = flats.filter(x => x.label === filters.label)
    }

    if(filters.rooms) {
      flats = flats.filter(x => filters.rooms.includes(x.rooms))
    }

    if(filters.square.min !== null) {
      flats = flats.filter(x => x.square >= filters.square.min)
    }

    if(filters.square.max !== null) {
      flats = flats.filter(x => x.square <= filters.square.max)
    }

    if(filters.price.max !== null) {
      flats = flats.filter(x => x.price <= filters.price.max)
    }

    if(filters.price.min !== null) {
      flats = flats.filter(x => x.price >= filters.price.min)
    }

    if(filters.sort) {
      let sortFunction = () => {}

      switch(filters.sort) {
        case "priceToUp":
            sortFunction = (a, b) => a.price - b.price
            break
        case "priceToDown":
            sortFunction = (a, b) => b.price - a.price
            break
        case "squareToUp":
            sortFunction = (a, b) => a.square - b.square
            break
        case "squareToDown":
            sortFunction = (a, b) => b.square - a.square
            break
      }

      flats = flats.sort(sortFunction)
    }

    //вставляем количество найденных квартир
    document.querySelector('[data-filterd-number]').textContent = flats.length

    const paginationElement = document.querySelector('.pagination')
    paginationElement.querySelectorAll('.pagination__page')
                     .forEach(element => element.remove())

    pagination.commonPage = Math.ceil(flats.length / pagination.flatInPage) //сколько будет цифр в пагинации

    if(pagination.currentPage > pagination.commonPage) {
      pagination.currentPage = 1
    }

    for(let i = 0; i < pagination.commonPage; i++) {
      const aElement = document.createElement('a')
      aElement.href="#"
      aElement.className = 'pagination__page'
      aElement.textContent = i + 1
      paginationElement.insertBefore(aElement, paginationElement.lastElementChild) //вставляем перед последним элементом

      if(i === pagination.currentPage - 1 ) {
        aElement.classList.add('pagination__page--active')
      }
    }

    //считаем какие page нужно отобразить
    const fromIndex = (pagination.currentPage - 1) * pagination.flatInPage
    const toIndex = pagination.currentPage * pagination.flatInPage - 1

    flats = flats.filter((x, i) => fromIndex <= i && i <= toIndex)

    return flats
  }

  View.clickhandler = function clickhandler(flatId) {
    Model.setLike(flatId)
  }

})();