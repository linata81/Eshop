;(function() {
  'use strict';

  const id = getId()

  //запросим данные от сервера
  fetch('/database.json')
    .then(answer => answer.json())
    .then(data => {
      Model.setData(data)
      const flat = Model.getFlatBuId(id)
      View.updateFlatCard(document.body, flat)
    })
  



  //получение id квартиры
  function getId (){
    if(location.search.includes('?') && location.search.includes('id=')) {
      const array = location.search.slice(1).split('=')
      const index = array.indexOf('id')
  
      return parseInt(array[index + 1])
    }
  }

})();