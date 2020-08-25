const limit = 10; //зададим количетво элементов на странице

// функция записи данных в localStorage
function setLocalStorage(numberPage) {
  let tableBody = document.getElementById('tableBody'); //находим tableBody
  let rows = tableBody.getElementsByTagName('tr');  //находим все строки в tableBody
  let array = []; //создаем пустой массив. Здесь будем хранить все наши данные из таблицы
  for (let i = 0; i < rows.length; i++) { // пройдемся циклом по массиву строк
    let data = {}; //создадим пустой объект, в который запишем пары ключ - значение, которые соответствуют нашим данным в таблице
    data['firstName'] = rows[i].children[0].innerHTML;
    data['lastName'] = rows[i].children[1].innerHTML;
    data['about'] = rows[i].children[2].innerHTML;
    data['eyeColor'] = rows[i].children[3].innerHTML;
    array.push(data); // добавим объект в массив
  };
  
  localStorage.setItem(`page${numberPage}`, JSON.stringify(array)); //Запишем данные в localStorage. При записи в localStorage надо конвертировать массив в строку, т.к. localStorage принимает только строки в виде значения ключей
};

//получение данных из localStorage
function getLocalStorage(numberPage) {
  return data = JSON.parse(localStorage.getItem(`page${numberPage}`));
};

//загрузка данных из файла json для первой страницы (необходимое кол-во элементов определено в limit)
window.fetch('/JSONData.json') // отправляем запрос к серверу
  .then(function(response) { //функция обработчик после того, как пришел результат. Функция получает на вход ответ, который пришел от сервера
    console.log(response);
    return response.json(); //берем содержимое ответа и парсим его в формате JSON
  })
  .then(function(response) { //функция обработчик. На вход получила массив-объектов из первой функции (после парсинга)
    console.log(response);

    let tableFoot = document.getElementById('tableFoot'); //найдем элемент в разметке HTML, в который нужно вставить информацию
    
    for (let i = 0; i < response.length / limit; i++) { //пройдемся циклом, чтобы получить кол-во страниц и вставить их ссылками
      tableFoot.insertAdjacentHTML('beforeend', `<button onclick="loadNextPage(${i})">${i+1}</button>`)
      localStorage.removeItem(`page${i+1}`);//удалим данные из localStorage, чтобы при обновлении страницы загрузились первоначальные данные
    };

    let tableBody = document.getElementById('tableBody'); //найдем элемент в разметке HTML, в который нужно вставить информацию
    let data = response.map(elem =>
      `<tr>
        <td class='firstName'>${elem.name.firstName}</td>
        <td class='lastName'>${elem.name.lastName}</td>
        <td class='about'>
          ${elem.about}
        </td>
        <td class='eyeColor' style='background-color: ${elem.eyeColor}; color: ${elem.eyeColor}'>${elem.eyeColor}</td>
      </tr>`
    );

    for (let i = 0; i < limit; i++) {
      tableBody.insertAdjacentHTML('beforeend', data[i]);
    };
    
  //insertAdjacentHTML() разбирает указанный текст как HTML или XML и вставляет полученные узлы (nodes) в DOM дерево в указанную позицию.
  //позиция beforeend - вставка сразу перед закрывающим тегом element (после последнего потомка).
  //преобразуем массив при помощи map. Он вызывает функцию для каждого элемента массива и возвращает массив результатов выполнения этой функции.
  
  //выделим кнопку для первой страницы, чтобы понять на какой мы странице
  let buttonForPageOne = document.getElementById('tableFoot').getElementsByTagName('button')[0]; //найдем эту кнопку. Она соответствует нулевому элементу коллекции
  buttonForPageOne.classList.add('buttonIsPushed'); //добавим класс buttonIsPushed
  
  });

//функция для постраничной загрузки данных с сервера
function loadNextPage(n) {

  let tableBody = document.getElementById('tableBody'); //найдем элемент в разметке HTML, в который нужно вставить информацию

  // Удаление всех дочерних элементов
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  };

  //если мы сортировали столбцы, то при загрузке новой страницы нам нужно убрать символ сортировки со столбцов
  arrow = document.getElementsByClassName('arrow');//найдем все элементы у которых есть класс arrow
  for (let j = 0; j < arrow.length; j++) {
    arrow[j].innerHTML = '';
  }

  //если мы вызывали панель редактирование, то ее надо скрыть при загрузке новой страницы
  let editDiv = document.getElementById('edit'); // найдем элемент, в котором храниться наш DIVдля редактирования
  editDiv.classList.add('hidden'); //скроем DIV с редактированием

  //если мы скрывали столбцы, то нужно сделать их все видимыми (для шапки таблицы)
  let rowHead = document.getElementsByTagName('th'); //найдем ячейки в шапке нашей таблицы
  for (let i = 0; i < rowHead.length; i++) { //пройдем по ним с помощью цикла
    rowHead[i].classList.remove('hidden'); //удалим класс hidden, т.е. сделаем ячейку видимой
  }

  //все кнопки приведем в начальное состояние, когда на них еще ни разу не нажимали
  let buttonForHiddenCollum = document.getElementsByClassName('collum')[0].children; //находим кнопки
  for (let i = 0; i < buttonForHiddenCollum.length; i++) {//пройдем по ним с помощью цикла
    buttonForHiddenCollum[i].classList.remove('buttonIsPushed');//удалим класс buttonIsPushed
  }

  //выделим кнопку на которую нажали, чтобы понять на какой мы странице
  let buttonForPage = document.getElementById('tableFoot').getElementsByTagName('button'); //найдем все элементы с номерами страниц
  for (let i = 0; i < buttonForPage.length; i++) { //пройдемся циклом по всем элементам
    if (i == n) { //если номер элемента соответствует n, т.е. соответствует нужной нам странице
      buttonForPage[i].classList.add('buttonIsPushed');//добавим класс buttonIsPushed
    } else { // иначе
      buttonForPage[i].classList.remove('buttonIsPushed');//удалим класс buttonIsPushed
    }
  }
  
  //вызовим функцию для получения данных из LocalStorage. Если там есть данные для страницы на которую мы переходим, то загрузятся они. Если нет, то данные с сервера
  if (getLocalStorage(n+1) == null) {
    window.fetch('/JSONData.json') // отправляем запрос к серверу
    .then(function(response) { //функция обработчик после того, как пришел результат. Функция получает на вход ответ, который пришел от сервера
      return response.json(); //берем содержимое ответа и парсим его в формате JSON
    })
    .then(function(response) { //функция обработчик. На вход получила массив-объектов из первой функции (после парсинга)
      
      let data = response.map(elem =>
        `<tr>
          <td class='firstName'>${elem.name.firstName}</td>
          <td class='lastName'>${elem.name.lastName}</td>
          <td class='about'>
            ${elem.about}
          </td>
          <td class='eyeColor' style='background-color: ${elem.eyeColor}; color: ${elem.eyeColor}'>${elem.eyeColor}</td>
        </tr>`
      );
      
      //получаем значение первого и последующего элемента в соответствии с номером каждой страницы
      let begin = n * limit;
      let end = begin + limit;
      end = (begin + limit) > response.length ? response.length : (begin + limit); 

      //выводим с помощью цикла на страницу нужные нам элементы
      for (let i = begin; i < end; i++) {
        tableBody.insertAdjacentHTML('beforeend', data[i]);
      };
    });
  } else {
    tableBody.insertAdjacentHTML('beforeend', data.map(elem =>
      `<tr>
        <td class='firstName'>${elem.firstName}</td>
        <td class='lastName'>${elem.lastName}</td>
        <td class='about'>
          ${elem.about}
        </td>
        <td class='eyeColor' style='background-color: ${elem.eyeColor}; color: ${elem.eyeColor}'>${elem.eyeColor}</td>
      </tr>`
    ).join(''));  
  };

};
  

// поиск данных в колонке Описание
let inputSearchAbout = document.getElementById('searchAbout');
let cellAbout = document.getElementsByClassName('about'); //получим коллекцию всех элементов, которые соответствуют классу about (это необходимые нам ячейки для поиска)

inputSearchAbout.oninput = function() { //повесим на поле input обработчик событий oninput
  //Теперь мы пройдемся по этой коллекции используя цикл for in, так как нам нужны именно сами элементы, и посмотрим есть ли в них знечение, которое мы вводим в input. Для этого используем indexOf. toUpperCase используем, чтобы искате независимо от регистра
  for (let i = 0; i < cellAbout.length; i++) {
    //если введенная строка найдена в ячейке, то ячейка отображается, если строки нет в ячейке, то ячейка скрывается. Для этого используем css свойчтво display
    if (cellAbout[i].innerHTML.toUpperCase().indexOf(inputSearchAbout.value.toUpperCase()) > -1) {
      cellAbout[i].parentElement.style.display = ''; // здесь мы ищем потомка для нашей ячейки, чтобы добраться до строки таблицы и присваиваем строке свойство display
    } else {
      cellAbout[i].parentElement.style.display = 'none';
    };
  }
//фильтрация происходит динамически, так как обработчик oninput отслеживает каждый введенный нами символ
};

// функция для сортировки колонок в таблице
function sortTable(n) {
  let table, arrow, rows, switching, i, x, y, shouldSwitchdir, dir, switchcount = 0;

  table = document.getElementById('tableBody'); //получим все элементы таблицы, которые находятся в теле таблицы
  arrow = document.getElementsByClassName('arrow');//найдем все элементы у которых есть класс arrow
  switching = true;
  dir = "asc"; // установим направление сортировки по возрастанию:

  // с помощью цикла установим значение элемента для полей с классом arrow, когда поля не отсортированны
  for (let j = 0; j < arrow.length; j++) {
    arrow[j].innerHTML = '';
  };

  /*Делаем цикл, который будет продолжаться пока переключение не будет выполенно*/
  while (switching) {
    switching = false; //Установим переключение в false, т.е. не выполненно:
    rows = table.getElementsByTagName('tr'); //найдем все строки нашей таблицы

    /*пройдемся циклом по всем строкам тела таблицы*/
    for (i = 0; i < (rows.length - 1); i++) {
      //устновим shouldSwitch в позицию не должен быть перемещен:
      shouldSwitch = false;
      /*Возьмем два элемента для сравнения. Один с полученной строки, а второй со следующей строки:*/
      x = rows[i].getElementsByTagName('td')[n];
      y = rows[i + 1].getElementsByTagName('td')[n];
      /* Проверьте, должны ли два ряда поменяться местами,
       в зависимости от направления по возрастанию или по убыванию: */
      if (dir == "asc") { //для направления по возрастанию
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // Если да, отметьте переключатель и разорвите цикл:
          shouldSwitch = true;
          arrow[n].innerHTML = '&#9650'; //покажем направление сортировки
          break;
        };
      } else if (dir == "desc") { //для направления по убыванию
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // Если да, отметьте переключатель и разорвите цикл:
          shouldSwitch = true;
          arrow[n].innerHTML = '&#9660'; //покажем направление сортировки
          break;
        };
      };
    };

    if (shouldSwitch) {
      /* Если переключатель был помечен, сделайте перемещение
       и отметьте, что перемещение было выполнено: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Каждый раз когда выполняется перемещение счетчик увеличивается на 1:
      switchcount ++;
    } else {
      /* Если перемещение не было выполнено И направление - "asc",
       установим направление «desc» и снова запустите цикл  */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      };
    };
  };
};

// При клике на строку в соседнем с таблицей DIV’е отобразить форму редактирования данных выбранной строки.
// Вместо того, чтобы назначать обработчик onclick для каждой ячейки <td> (их может быть очень много) – мы повесим «единый» обработчик на элемент <tableBody>.
// Он будет использовать event.target, чтобы получить элемент, на котором произошло событие.

let clickedButton = false; //введем параметр, который будет определять состояние нашего поля редактирования. А имеенно былы ли нажата кнопка редактировать?

let table = document.getElementById('tableBody'); //получим все элементы таблицы, которые находятся в теле таблицы

table.onclick = function(event) {
  let buttonSEdit = document.getElementById('buttonEdit'); //найдем кнопку редактировать
  let buttonSave = document.getElementById('buttonSave'); //найдем кнопку сохранить
  buttonSEdit.classList.remove('buttonIsPushed');//вернем ей начальное оформление. Для этого удалим класс buttonIsPushed
  buttonSave.setAttribute('disabled', 'disabled'); //сделаем кнопку сохранить неактивной. Для этого дабавим ей атрибут disabled

  clickedButton = false;
  let target = event.target; // где был клик?
  if (target.tagName != 'TD') {     
    return; // не на TD? не интересует
  };
  let editDiv = document.getElementById('edit'); // найдем элемент, в котором храниться наш DIVдля редактирования
  editDiv.classList.remove('hidden'); //и сделаем его видимым
  let textArea = editDiv.getElementsByTagName('textarea')//найдем все дочерние taxtarea в нашем DIV для редактирования
  let targetRow = target.parentElement;//найдем родительский элемент для ячейки, на которую мы нажали. Это будет строка
  let tdElemForTargetRow = targetRow.getElementsByTagName('td');//найдем в строке все элементы td, t.e. ячейки
  //пройдемся циклом по всем найденным элементам textarea
  for (let i = 0; i < textArea.length; i++) {
    for (let j = 0; j < tdElemForTargetRow.length; j++) { //в него вложем цикл, который будет перебирать все элементы TD, в найденной строке
      if (textArea[i].name == tdElemForTargetRow[j].classList.value) { //если атрибут name текстового поля cовпадает с классом td, то переместим значение TD в текстовое поле
        textArea[i].value = tdElemForTargetRow[j].innerText;
      };
    }; 
  };
  editDiv.addEventListener('keydown', ev => {
    if (!clickedButton) {
      ev.preventDefault();
    };
  }); //запретим редактирование полей, пока пользователь не нажмет кнопку редактировать

  buttonSEdit.onclick = function() { //повесим обработчик на кнопку редактирования
    buttonSEdit.classList.add('buttonIsPushed');//отметим кнопку, чтобы было видно, что на нее нажали. Для этого добавим ей класс buttonIsPushed
    clickedButton = true; //разрешим редактировать наши данные по нажатию на кнопку Редактировать
    buttonSave.removeAttribute('disabled'); //сделаем ее активной. Для этого уберем атрибут dissable
    buttonSave.onclick = function() {//Повесим обработчик на кнопку сохранить. После изменения данных отобразим их в таблице в соответствующей строке
      for (let i = 0; i < textArea.length; i++) {//для этого пройдемся циклом по массиву из полей textarea
        for (let j = 0; j < tdElemForTargetRow.length; j++){ //в него вложем цикл, который будет перебирать все элементы TD, в найденной строке
          if (textArea[i].name == tdElemForTargetRow[j].classList.value) { //если атрибут name текстового поля cовпадает с классом td, то внесем в таблицу новые значения ячеек
            tdElemForTargetRow[j].innerText = textArea[i].value;
            tdElemForTargetRow[j].style.backgroundColor = textArea[i].value; //если меняем цвет глаз, то поменяем и фон ячейки
            tdElemForTargetRow[j].style.color = textArea[i].value; //если меняем цвет глаз, то поменяем и цвет текта
          }
        }
      }
      editDiv.classList.add('hidden'); //скроем DIV с редактированием
      
      //найдем номер страницы на которой было сделано редактирование
      let targetPageNumber = document.getElementById('tableFoot').children;
      let pageNumber;
      for (let i = 0; i < targetPageNumber.length; i++) {
        if (targetPageNumber[i].className == 'buttonIsPushed') {
          pageNumber = targetPageNumber[i].innerText;
        }
      } 

      setLocalStorage(pageNumber); //запишем изменения в localStorage. Где ключ - это номер страницы, где было сделано изменение
    }
  };
};

//скроем поле редактирование, если нажмем на любое пространство документа, кроме таблицы и самой карточки редактирования
document.onclick = function(event) {  
  let editDiv = document.getElementById('edit'); // найдем элемент, в котором храниться наш DIVдля редактирования
  let table = document.getElementsByTagName('table')[0]; //найдем элемент, который соответствует нашей таблице
  let target = event.target; // где был клик?
  if (!table.contains(target) && !editDiv.contains(target)) {//если не на таблице или карточке, то  
    editDiv.classList.add('hidden'); //скроем карточку редактирования
  }
};

//функция для показа и скрытия колонок. Будем использовать toggle() для добавлени/удаления (переключения) класса
function toggleHidden(n) {
  let rows = document.getElementsByTagName('tr'); //найдем все строки нашей таблицы
  let divForHiddenCollum = document.getElementsByClassName('collum');//найдем элемент с кнопками
  let buttonForHiddenCollum = divForHiddenCollum[0].children; //найдем всех потомков данного элемента
  buttonForHiddenCollum[n].classList.toggle('buttonIsPushed'); //для кнопки, по которой нажали добавим/удалим класс

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].getElementsByTagName('td').length == 0) { //если с строке мы не нашли элементы td (например, это строка с заголовком таблицы)
      rows[i].getElementsByTagName('th')[n].classList.toggle('hidden'); //то ищем в этой строке элементы th. Когда находим скрываем/раскрываем элемент, который соответствует нужной нам колонке. Это колонка n.
    } else {
      rows[i].getElementsByTagName('td')[n].classList.toggle('hidden'); //иначе находим элемент td и скрываем/раскрываем тот, кторый в нужной нам колонке
    }    
  }
};



