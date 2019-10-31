;(function() {
  'use strict';

  const database = {
    viewMode: 'showcase', //showcase or listcase
    flats: []
  }

  const api = window.Model = {
    dispatch(){}
  }

  //создаем копию данных, пришедших с сервера и добавляем их в flats
  api.setData = function setData(data){
    database.flats = getDeepCopy(data)
    api.dispatch()
  }

  //получаем массив всех квартир
  api.getFlats = function getFlats(){
    return getDeepCopy(database.flats)
  }

  //возвращает квартиру по id
  api.getFlatBuId = function getFlatBuId(id){
    for(const item of database.flats) {
      if(item.id === id) {
        return JSON.parse(JSON.stringify(item))
      }
    }
  }

  //получаем значение viewMode
  api.getViewMode = function getViewMode(){
    return database.viewMode
  }
  
  //изменяем значени viewMode
  api.setViewMode = function setViewMode(viewMode){
    database.viewMode = viewMode
    api.dispatch()
  }

  //изменяем значение like в database
  api.setLike = function setLike(flatId){
    for(const flat of database.flats) {
      if(flat.id === flatId) {
        if(flat.like === true) {
          flat.like = false
        }
        else if(flat.like === false){
          flat.like = true
        }
      }
    }

    api.dispatch()
  }

  //функция клонирует объект
  function getDeepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  /*-----------------------------------------------*/
  /*нужно ли это для лайков ???*/
  // //сохраняем в localStorage database
  // function save() {
  //   localStorage.setItem('Eshop', JSON.stringify(database))
  // }

  // //возвращает database из localstorage
  // function load(){
  //   if(localStorage.getItem('Eshop')) {
  //     const data = JSON.parse(localStorage.getItem('Eshop'))
  //     Object.assign(database, data)
  //   }
  // }
  /*-----------------------------------------------*/
})();