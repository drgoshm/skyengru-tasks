/* app.js */
'use strict';
window.addEventListener('load', () => {
	const params = {
			devicePixelRatio: 1,
			valueToString: (val, short) => {
				var date = new Date(val).toDateString();
				if (short) {
					return date.slice(4, date.length - 5);	
				}
				return date.slice(0, 3) + ', ' + date.slice(4);
			},
			onValueSelect: (selectedX, data) => {
				const calcTrend = (currentValue, prevValue, cell)  => {
					if(prevValue === 0) {
						cell.textContent = 0;
						cell.classList.remove('positive', 'negative');
						return;
					}
					if(prevValue - currentValue === 0) {
						cell.textContent = prevValue;
						cell.classList.remove('positive', 'negative');
						return;
					}
					if(prevValue - currentValue > 0) {
						cell.textContent = prevValue + ` (-${( (prevValue - currentValue) / currentValue * 100).toFixed(1)}%)`;
						cell.classList.add('negative');
						cell.classList.remove('positive');
					} else {
						cell.textContent = prevValue + ` (+${( (currentValue - prevValue) / currentValue * 100).toFixed(1)}%)`;
						cell.classList.add('positive');
						cell.classList.remove('negative');
					}
					
				};
				data.forEachColumn((column) => {
					const postfix = column.name.toLowerCase().replace(' ', '_');
					const cells = document.querySelectorAll(`#detail-${postfix}>td:not(:first-child)`);
					if(!cells || cells.length < 3) return;
					cells[0].textContent = column.values[selectedX.index];
					calcTrend(column.values[selectedX.index], selectedX.index !== 0 ? column.values[selectedX.index - 1] : 0, cells[1]);
					calcTrend(column.values[selectedX.index], selectedX.index >= 7 ? column.values[selectedX.index - 7] : 0, cells[2]);
				});
				return false;
			},
			debug:false
		},
		Chart = new ChartView('chart', 'Proceeds', params, new DataLoader('data/', {before:'data'}));
	
	window.switchMode = function () {
		let mode = document.getElementById('mode').innerText.toLowerCase();
		if (mode === 'night') {
			document.getElementsByTagName('body')[0].className = 'night';
			document.getElementById('mode').innerText = 'Day';
		} else {
			document.getElementsByTagName('body')[0].className = 'day';
			document.getElementById('mode').innerText = 'Night';
		}
		for(const view of chartViews) {
			Chart.updateColors();
		}
	};
});