(function() {
	"use strict";
	// сортировка по цене
	var sortButton = document.querySelector(".flats-item__price-title");
	function sortP() {
		var classname = document.querySelectorAll('.flats-item:not(.flats-item__title)');
		var divs = [];
		for (var i = 0; i < classname.length; ++i) {
			divs.push(classname[i]);
		}
		divs.sort(function(a, b) {
			//return a.dataset.price.localeCompare(b.dataset.price);
			if ( sortButton.classList.contains('text-green') ) {
				return +a.dataset.price - +b.dataset.price;
			} else {
				return +b.dataset.price - +a.dataset.price;
			}			
		});

		var br = document.getElementsByTagName(".flats-item")[0];

		divs.forEach(function(el) {
			document.querySelector('.flats-items').insertBefore(el, br);
		});
		sortButton.classList.toggle('text-green');
		sortButton.querySelector('.arrow-up').classList.toggle('active');
		sortButton.querySelector('.arrow-down').classList.toggle('active');
	}

	sortButton.addEventListener('click', sortP);

	// выстроим квартиры
	const listFlats = document.querySelector(".flats-items");
	const showMore = document.querySelector('.flats-btn .btn');
	let loadedFlats = 0;
	var totalFlats;

	async function getResponse() {
	  let response = await fetch("db.json");
	  let content = await response.json();
	  totalFlats = content.length;	  
	  content = content.slice(loadedFlats, loadedFlats + 4); //изначально 4 квартиры

	  let key;
	  for (key in content) {
	    listFlats.innerHTML += `
	    <div class="flats-item" data-room="${content[key].room}" data-square="${content[key].square}" data-floor="${content[key].floor}" data-price="${content[key].price}">
            <div class="flats-item__plan"><img src="assets/img/${content[key].image}" alt=""></div>
            <div class="flats-item__name">${content[key].flatName}</div>
            <div class="flats-item__square">${content[key].square} <span class="d-none">м<sup>2</sup></span></div>
            <div class="flats-item__floor">${content[key].floor} <span class="text-muted">из 17 <span class="d-none">этаж</span></span></div>
            <div class="flats-item__price">${content[key].price.toLocaleString('ru')} <span class="d-none">₽</span></div>
        </div>
	    `
	  }
	}
	getResponse();
	// показать еще квартиры
	showMore.addEventListener('click', () => {
        if (loadedFlats <= (totalFlats - 4)) {
            loadedFlats = loadedFlats + 4; // покажем по 4 квартиры
            if (loadedFlats >= 12 ) {
            	showMore.textContent = 'Загрузить еще 0 из ' + totalFlats;
            } else {
            	showMore.textContent = 'Загрузить еще ' + ((totalFlats - 4) - loadedFlats) + ' из ' + totalFlats;
            }
            
            getResponse();
        } else {
            showMore.remove();
        };
    });
	// кнопка подняться наверх
	var scrollUpBtn = document.querySelector('.scroll-up-btn');
	window.onscroll = () => {
		if (pageYOffset > 80) scrollUpBtn.style.opacity = '1';
		if (pageYOffset < 10) scrollUpBtn.style.opacity = '0';
	};
	// фильтры
	var filterPrice = new rSlider({
	    target: '#filterPrice',
	    values: {min:5500000, max:7800000},
	    range: true,
	    width:    null,
	    scale:    false,
	    labels:   false,
	    tooltip:  true,
	    set: [5800000, 7200000],
	    step:     10000,
	    disabled: false,
	    onChange: function(vals){
			priceMin = vals.split(",")[0];
			priceMin = parseInt(priceMin).toLocaleString('ru');
			document.getElementById('priceMin').textContent = priceMin;
			priceMax = vals.split(",")[1];
			priceMax = parseInt(priceMax).toLocaleString('ru');
			document.getElementById('priceMax').textContent = priceMax;
			priceValue(vals);
		}
	});

	let priceMin = document.querySelectorAll(".rs-pointer[data-dir='left']")[0].textContent;
	priceMin = parseInt(priceMin).toLocaleString('ru');
	document.getElementById('priceMin').textContent = priceMin;

	let priceMax = document.querySelectorAll(".rs-pointer[data-dir='right']")[0].textContent;
	priceMax = parseInt(priceMax).toLocaleString('ru');
	document.getElementById('priceMax').textContent = priceMax;

	var defaultPrice = filterPrice.getValue(); // запомним данные для ресета

	var filterSquare = new rSlider({
	    target: '#filterSquare',
	    values: {min:50, max:99},
	    range: true,
	    width:    null,
	    scale:    false,
	    labels:   false,
	    tooltip:  true,
	    set: [60, 90],
	    step:     1,
	    disabled: false,
	    onChange: function(vals){
			squareMin = vals.split(",")[0];
			document.getElementById('squareMin').textContent = squareMin;
			squareMax = vals.split(",")[1];
			document.getElementById('squareMax').textContent = squareMax;
			squareValue(vals);
		}
	});

	let squareMin = document.querySelectorAll(".rs-pointer[data-dir='left']")[1].textContent;
	document.getElementById('squareMin').textContent = squareMin;

	let squareMax = document.querySelectorAll(".rs-pointer[data-dir='right']")[1].textContent;
	document.getElementById('squareMax').textContent = squareMax;

	const defaultSquare = filterSquare.getValue(); // запомним данные для ресета

	// Выделяем комнаты и меняем в видимых
	const roomsBtns = document.querySelectorAll('.filters-rooms__btn');
	const defaultRoom = document.querySelector('.filters-rooms__btn.active');
	
	roomsBtns.forEach(roomsBtn => {
	  roomsBtn.addEventListener('click', function(e) {
	  	let dataRoom = roomsBtn.dataset.room;
	  	let nameFlats = document.querySelectorAll('.flats-item:not(.flats-item__title)');
	  	nameFlats.forEach(nameFlat => {
	  		let dataRoomFlat = nameFlat.dataset.room;
	  		if (dataRoomFlat == dataRoom) {
	  			nameFlat.style.display = '';
	  		} else {
	  			nameFlat.style.display = 'none';
	  		}
	  	});
	    document.querySelector('.filters-rooms__btn.active').classList.remove('active');
	    e.target.classList.add('active');	    
	  });
	});

	function priceValue(value) { // фильтр по цене
		let minPrice = value.split(",")[0];
		let maxPrice = value.split(",")[1];
		let priceFlats = document.querySelectorAll('.flats-item:not(.flats-item__title)');
	  	priceFlats.forEach(priceFlat => {
	  		let dataPriceFlat = priceFlat.dataset.price;
	  		if (dataPriceFlat >= minPrice && dataPriceFlat <= maxPrice) {
	  			priceFlat.style.display = '';
	  		} else {
	  			priceFlat.style.display = 'none';
	  			//document.querySelector('.flats-item__title').style.display = '';
	  		}
	  	});
	}
	function squareValue(value) { // фильтр по площади
		let minSquare = value.split(",")[0];
		let maxSquare = value.split(",")[1];
		let squareFlats = document.querySelectorAll('.flats-item:not(.flats-item__title)');
	  	squareFlats.forEach(squareFlat => {
	  		let dataSquareeFlat = squareFlat.dataset.square;
	  		if (dataSquareeFlat >= minSquare && dataSquareeFlat <= maxSquare) {
	  			squareFlat.style.display = '';
	  		} else {
	  			squareFlat.style.display = 'none';
	  			//document.querySelector('.flats-item__title').style.display = '';
	  		}
	  	});
	}

	// Сброс данных фильтра
	let resetBtn = document.querySelector('.filters-reset__btn');
	resetBtn.addEventListener('click', function(e) {
		filterPrice.setValues(parseInt(defaultPrice.split(",")[0]) , parseInt(defaultPrice.split(",")[1]));
		filterSquare.setValues(parseInt(defaultSquare.split(",")[0]) , parseInt(defaultSquare.split(",")[1]));
		roomsBtns.forEach(roomsBtn => {
			roomsBtn.classList.remove('active');
		});
		defaultRoom.classList.add('active');
		let nameFlats = document.querySelectorAll('.flats-item');
	  	nameFlats.forEach(nameFlat => {
	  			nameFlat.style.display = '';
	  	});
	  	/*priceValue(defaultPrice);
	  	squareValue(defaultSquare);*/
	});
	
})()

//подняться наверх
function scrollToTop(){
  window.scrollTo(0, 0);
}
