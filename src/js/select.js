const helpers = require('apps-helpers');
const camelCase = require('lodash/camelCase');

// ### VARIABLES
module.exports = function (element) {
	const clsNames = {
		select: 'select',
		options: 'options',
		optionsItem: 'option',
		optionsItemSelected: 'selected',
		output: 'select-output'
	};

	// Estrutura dos Elementos do DOM
	const elements = helpers.collectionsMap(element, {
		select: `.${clsNames.select}`,
		input: null,
		optionsContainer: `.${clsNames.options}`,
		optionsAllElements: `*(parent:optionsContainer)`, // Todos os elementos filhos do (element.options)
		optionsList: null, // Somente elementos filhos do (element.options) com a classe option
		optionSelected: null, // Somente .option.selected
		output: `.${clsNames.output}`
	});

	// ** Dados
	const datas = {
		// Dados estáticos
		indexOptionSelected: null,
		elementsTotal: null,
		elementsHeight: null, // setProps

		// Position
		offsetTop: null,
		offsetBottom: null,
		offsetTopSize: null,
		offsetBottomSize: null,
		optionsContainerWidth: null,

		props: null,
		windowWidth: null,
		windowHeight: null
	};
	
	const coordinates = {
		left: null,
		right: null,
		top: null,
		bottom: null,
		clientTop: null,
		clientBottom: null
	};

	helpers.encapsulation(datas, elements, coordinates);
	
	const init = function () {
		datas.set('props', {});
		datas.set('elements.height', []);
		elements.set('options.list', []);
		datas.set('elements.total', elements.get('options.all.elements').length);

		elements.get('options.all.elements').forEach((element, index) => {
			if (element.classList.contains(clsNames.optionsItem)){
				elements.set('options.list', element, index);

				if (element.classList.contains(clsNames.optionsItemSelected)){
					datas.set('index.option.selected', index);
					elements.set('option.selected', element);
				}
			}
		});

		output.setContent();
		input.create();

		// ### SET STYLES
		let computedStyle = window.getComputedStyle(elements.get('output')); // output style

		[
		'border-top-width',
		'border-bottom-width',
		'border-radius',
		'line-height',
		'padding-top',
		'padding-right',
		'padding-bottom',
		'padding-left',
		'font-size',
		'width',
		'height'
		].forEach(prop => {
			let name = camelCase(prop);
			let value = parseFloat(computedStyle.getPropertyValue(prop));
			datas.set('props', Math.ceil(value), name);
		});

		['width', 'fontSize', 'lineHeight', 'paddingTop', 'borderRadius', 'paddingBottom'].forEach(prop => {
			let name = prop;
			let value = datas.get('props', prop);

			if (name === 'width'){
				name = 'minWidth';
				value += 20;
			}

			elements.get('options.container').style[name] =  value + 'px';
		});

		elements.get('options.list').forEach(option => {
			option.style.height = datas.get('props', 'lineHeight') + 'px';
		});

		elements.get('options.all.elements').forEach(e => {
			datas.add('elements.height', parseInt(window.getComputedStyle(e).getPropertyValue('height')));
		});

		// ## ADD EVENTS
		elements.get('output').addEventListener('click', events.show);
		elements.get('options.list').forEach((option, index) => {
			if (!option.classList.contains('disabled')){
				option.addEventListener('click', () => {
					events.hide(option, index);
				});
			}
		});
	}

	const output = {
		setContent(){
			if (elements.get('option.selected')){
				elements.get('output').textContent = elements.get('option.selected').textContent;
			}
		}
	}

	const input = {
		create(){
			let element = document.createElement('input');
				element.type = 'hidden';
				element.name = elements.get('select').getAttribute('id');

			elements.set('input', element);
			this.setValue();

			helpers.insertAfter(elements.get('input'), elements.get('output'));
		},
		setValue(){
			if (elements.get('option.selected')){
				elements.get('input').value = elements.get('option.selected').getAttribute('value');
			}
		}
	}

	const events = {
		show(event){
			datas.set('window.width', window.innerWidth);
			datas.set('window.height', window.innerHeight);
			datas.set('props', elements.get('output').offsetWidth, 'width'); // Update output element width

			// *** COORDINATES X

			/** clientX (Posição do clique até a borda lateral esquerda)
			  * offsetX (Posição do clique até a borda lateral do elemento)
			  */
			coordinates.set('left', event.clientX - (event.offsetX + 1)); // Distância da lateral esqueda até o elemento
			coordinates.set('right', datas.get('window.width') - (coordinates.get('left')  + datas.get('props', 'width'))); // Distância da lateral direita até o elemento

			// *** COORDINATES Y
			coordinates.set('top', event.clientY - (event.offsetY + 1)); // Distância do elemento até o topo 
			coordinates.set('bottom', datas.get('window.height') - (coordinates.get('top')  + datas.get('props', 'height'))); // Distância do elemento até o rodapé 
			
			// COORDINATES CLIENT
			coordinates.set('client.top', datas.get('window.height') - coordinates.get('bottom')); // coordinates-top + element-height
			coordinates.set('client.bottom', datas.get('window.height') - coordinates.get('top')); // coordinates-bottom + element-height

			coordinates.set('client.left', datas.get('window.width') - coordinates.get('right')); // coordinates-top + element-height
			coordinates.set('client.right', datas.get('window.width') - coordinates.get('left')); // coordinates-bottom + element-height

			// ## OFFSET ##
			// # OFFSET >> index
			datas.set('offset.top', datas.get('index.option.selected')); // Faz a contagem do selecionado até do topo
			datas.set('offset.bottom', datas.get('elements.total') - datas.get('index.option.selected') - 1); // Faz a contagem do selecionado até o rodapé

			// # OFFSET >> size
			datas.set('offset.top.size', getOffset(datas.get('offset.top')));
			datas.set('offset.bottom.size', getOffset(datas.get('elements.total') - 1, datas.get('index.option.selected')));

			elements.get('options.container').style.display = 'block';
			elements.get('options.container').style.maxHeight = 'initial';

			if (!datas.get('options.container.width')){
				datas.set('options.container.width', elements.get('options.container').offsetWidth);
				elements.get('options.container').style.width = datas.get('options.container.width') + 20 + 'px'; // + 20 scroll bar
				elements.get('select').style.position = 'relative';
			}

			// ## GETTING POSITION LOCATION
			let north  = coordinates.get('client.top') <= 200;
			let south  = coordinates.get('client.bottom') <= 200;
			let middle = !north && !south;
			let full   = (north ||  south) && elements.get('options.container').scrollHeight >= datas.get('window.height');

			// ## SETTING POSITION LOCATION - FULL
			if(full) {
				elements.get('options.container').style.top = `-${coordinates.get('top')}px`;
				elements.get('options.container').style.maxHeight = `${datas.get('window.height')}px`;
				elements.get('options.container').scrollTop = datas.get('offset.top.size') - coordinates.get('top');
			}

			// ## GETTING POSITION LOCATION - NORTH
			else if (north){
				elements.get('options.container').style.top = 0 + 'px';
				elements.get('options.container').style.maxHeight = coordinates.get('client.bottom') + 'px';
			}

			// ## GETTING POSITION LOCATION - MIDDLE
			else if (middle){
				events.resize();
			}

			// ## GETTING POSITION LOCATION - SOUTH
			else if (south){
				let max = elements.get('options.container').offsetHeight;
					max -= elements.get('output').offsetHeight;
			
				elements.get('options.container').style.top = '-' + max + 'px';
				elements.get('options.container').style.maxHeight = coordinates.get('client.top') + 'px';
			}


			// ## GETTING POSITION LOCATION - EAST
			if (coordinates.get('left') < coordinates.get('right')){
				elements.get('options.container').style.left = 0;
				elements.get('options.container').style.right = 'auto';
			}else{
				elements.get('options.container').style.left = 'auto';
				elements.get('options.container').style.right = 0;
			}

			// console.log(north, south);
			// ## GETTING POSITION LOCATION - WEST
		}
	};

	events.hide = function (option = null, index) {
		if (option){
			if (elements.get('option.selected')){
				elements.get('option.selected').classList.remove('selected');
			}

			option.classList.add('selected');

			datas.set('index.option.selected', index);
			elements.set('option.selected', option);
			input.setValue();
			output.setContent();
		}

		elements.get('options.container').style.display = 'none';
	}

	events.resize = function () {
		let top = datas.get('offset.top.size') >= coordinates.get('top') - 1;
		let bottom = datas.get('offset.bottom.size') >= coordinates.get('bottom');
		let element = elements.get('optionsContainer');

		setPosition();
		
		// ## full
		if (top && bottom){
			element.style.top = `-${coordinates.get('top')}px`;
			element.style.maxHeight = datas.get('window.height') + 'px';
			element.scrollTop = datas.get('offset.top.size') - coordinates.get('top');
		}

		// ## top
		else if (top && !bottom){
			let max = coordinates.get('client.top');
				max += datas.get('offset.bottom.size');

			element.style.maxHeight = max + 'px';
			element.style.top = `-${coordinates.get('top')}px`;
			element.scrollTop = element.scrollHeight - element.clientHeight;
		}
		// ## bottom
		else if (bottom && !top){
			let max = coordinates.get('client.bottom');
				max += getOffset(datas.get('index.option.selected'));

			element.style.maxHeight = max + 'px';
			element.scrollTop = 0;
		}
		// ## reset
		else if (!top && !bottom) {}
	}

	// POSITION
	const getOffset = function(max, start = 0) {
		return datas.get('elements.height').slice(start, max).reduce((prev, current) => {
			return prev + current;
		}, 0);
	}

	const setPosition = function () {
		let positionTop = 0;
			positionTop -= elements.get('option.selected') ? datas.get('offset.top.size') : 0;
		elements.get('options.container').style.top = positionTop + 'px';
	}

	init();
}





