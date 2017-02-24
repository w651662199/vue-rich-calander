<template>
	<table class="rich-calander-table" cellspacing="0" cellpadding="0">
        <thead>
        <tr>
        	<th :class="{'col-selected': isAllDaysSelected}" @click="selectAllDays"></th>
        	<th v-for="(week, index) in WEEKS" :class="{'col-selected': week.selected}" @click='selectColumnDates(index)'>{{ week.value}}</th>
        </tr>
        </thead>
        <tbody>
        	<tr v-for="(row, index) in dateRows">
        		<td :class="{'row-selected': rowSelected[index]}" @click="selectWithRow(index)">></td>
        		<td v-for="item in row"
        			:class="getItemClass(item)"
        			v-text="item.text"
        			@click="handleClick(item)"></td>
        	</tr>
        </tbody>
    </table>
</template>
<script>
import { getDayCountOfMonth, isDayInSelectedDays, DAY_DURATION } from '../utils/common.js';

const clearHours = function(time) {
    const cloneDate = new Date(time);
    cloneDate.setHours(0, 0, 0, 0);
    return cloneDate.getTime();
};
export default{
	name: 'UiDateTable',
	props: {
		year: {},
		month: {},
		selectDays: {
			type:Array
		}
	},
	data() {
		return {
			WEEKS: [
				{value: '日', selected: false},
				{value: '一', selected: false},
				{value: '二', selected: false},
				{value: '三', selected: false},
				{value: '四', selected: false},
				{value: '五', selected: false},
				{value: '六', selected: false}],
			tableRows: [[],[],[],[],[],[]],
			rowSelected: [false,false,false,false,false,false],
			isAllDaysSelected: false
		};
	},
	created() {
		this.checkEveryDaySelected();
	},
	computed: {
		offset() {
			return new Date(this.year,this.month,1).getDay();
		},
		dateRows() {
			const date = new Date(this.year,this.month,1);
			const dayCountOfMonth = getDayCountOfMonth(this.year,this.month);
			const dayCountOfPreMonth = getDayCountOfMonth(this.year,this.month == 0 ? 11 : this.month -  1);
			const rows = this.tableRows;
			const offset = this.offset;
			const now = clearHours(new Date());
			let dateText = 1;
			for(let i = 0;i < 6;i++) {
				const row = rows[i];
				for(let j = 0;j < 7;j++) {
					let item = row[j];
					if (!item) {
						item = {row: i, column: j, type: 'normal', selected: false};
					}
					item.type = 'normal';
					if (i >= 0 && i <= 1) {
						if (j + i * 7 >= offset) {
							item.text = dateText++;
						}else{
							item.text = dayCountOfPreMonth - offset + j % 7 + 1;
							item.type = 'prev-month';
						}
					}else{
						if (dateText > dayCountOfMonth) {
							item.type = 'next-month';
							item.text = dateText++ - dayCountOfMonth;
						}else{
							item.text = dateText++;
						}
					}
					let time = new Date(this.year,this.month,item.text).getTime();
					let isToday = time == now;
					if (isToday && item.type == 'normal') {
						item.type = 'today';
					}

					item.disabled = time < now && item.type === 'normal';
					item.selected = isDayInSelectedDays(new Date(this.year,this.month,item.text),this.selectDays);
					this.$set(row, j, item);
				}
			}
			return rows;
		}
	},
	methods: {
		selectAllDays() {
			let isSelected = this.isAllDaysSelected;
			let rowCount = this.dateRows.length;
			let colCount = this.WEEKS.length;
			for (let i = 0; i < rowCount; i++) {
				for (let j = 0; j < colCount; j++) {
					let item = this.dateRows[i][j];
					if (isSelected) {
						if (item.selected) {
							this.handleClick(item);
						}
					} else {
						if (!item.selected) {
							this.handleClick(item);
						}
					}
				}
			}
		},
		handleClick(item) {
	        if (this.isDateItemSelectable(item)) {
				this.$emit('pick',{year:this.year,month:this.month,date:item.text});
				this.dateRows[item.row][item.column].selected = !item.selected;
				this.setColumnSelectState(item.column);
				this.setRowSelectState(item.row);
	        }
		},
		isDateItemSelectable(dateItem) {
			return (dateItem.type === 'normal' || dateItem.type === 'today') && !dateItem.disabled;
		},
		getItemClass(item) {
			let classes = [];
	        if ((item.type === 'normal' || item.type === 'today') && !item.disabled) {
				classes.push('available');
				if (item.type === 'today') {
					classes.push('today');
				}
				if (item.selected) {
					classes.push('selected');
				}
	        }else {
	        	classes.push(item.type);
	        }
	        if (item.disabled) {
				classes.push('disabled');
			}
	        return classes.join(' ');
		},
		setColumnSelectState(columnIndex) {
			let isSelected = true;
			const columnDates = this.getColumnDateByColIndex(columnIndex);
			for (let c = 0; c < columnDates.length; c++) {
				const columnDateItem = columnDates[c];
				if (this.isDateItemSelectable(columnDateItem) && !columnDateItem.selected) {
					isSelected = false;
					break;
				}
			}
			this.switchColumnSelectState(columnIndex, isSelected);
		},
		switchColumnSelectState(columnIndex, isSelected) {
			this.WEEKS[columnIndex].selected = isSelected;
			this.isAllDaysSelected = this.isAllDaysSelected && !isSelected ? !this.isAllDaysSelected : this.isAllDaysSelected;
		},
		getColumnDateByColIndex(columnIndex) {
			let columnDates = [];
			for (let r = 0; r < this.dateRows.length; r++) {
				let columnDateItem = this.dateRows[r][columnIndex];
				if (this.isDateItemSelectable(columnDateItem)) {
					columnDates.push(columnDateItem);
				}
			}
			return columnDates;
		},
		getRowDateByRowIndex(rowIndex) {
			let rowDates = [];
			let dates = this.dateRows[rowIndex];
			for (let i = 0; i < dates.length; i++) {
				let rowDateItem = dates[i];
				if (this.isDateItemSelectable(rowDateItem)) {
					rowDates.push(rowDateItem);
				}
			}
			return rowDates;
		},
		setRowSelectState(rowIndex) {
			let isSelected = true;
			let rowDates = this.getRowDateByRowIndex(rowIndex);
			for (let i = 0; i < rowDates.length; i++) {
				let rowDateItem = rowDates[i];
				if (this.isDateItemSelectable(rowDateItem) && !rowDateItem.selected) {
					isSelected = false;
					break;
				}
			}
			this.switchRowSelectState(rowIndex, isSelected);
		},
		switchRowSelectState(rowIndex, isSelected) {
			this.rowSelected[rowIndex] = isSelected;
		},
		selectColumnDates(columnIndex) {
			let isSelected = this.WEEKS[columnIndex].selected;
			let columnDates = this.getColumnDateByColIndex(columnIndex);
			if (isSelected) {
				this.resetDatesSelected(columnDates);
			} else {
				this.setDatesSelected(columnDates);
			}
			this.WEEKS[columnIndex].selected = !isSelected;
		},
		resetDatesSelected(dates) {
			for (let i = 0; i < dates.length; i++) {
				let dateItem = dates[i];
				if (dateItem.selected) {
					this.$emit('pick', {year: this.year, month: this.month, date: dateItem.text});
					this.dateRows[dateItem.row][dateItem.column].selected = !dateItem.selected;
				}
				this.setRowSelectState(dateItem.row);
				this.setColumnSelectState(dateItem.column);
				continue;
			}
		},
		setDatesSelected(dates) {
			for (let i = 0; i < dates.length; i++) {
				let dateItem = dates[i];
				if (!dateItem.selected) {
					this.$emit('pick', {year: this.year, month: this.month, date: dateItem.text});
					this.dateRows[dateItem.row][dateItem.column].selected = !dateItem.selected;
				}
				this.setRowSelectState(dateItem.row);
				this.setColumnSelectState(dateItem.column);
				continue;
			}
		},
		selectWithRow(rowIndex) {
			let isSelected = this.rowSelected[rowIndex];
			let rowDates = this.getRowDateByRowIndex(rowIndex);
			if (rowDates.length > 0) {
				if (isSelected) {
					this.resetDatesSelected(rowDates);
				} else {
					this.setDatesSelected(rowDates);
				}
				this.rowSelected[rowIndex] = !isSelected;
			}
		},
		isColumnSelected(colIndex) {
			let dates = this.getColumnDateByColIndex(colIndex);
			let isSelected = true;
			for (let i = 0; i < dates.length; i++) {
				if (!dates[i].selected) {
					isSelected = false;
					break;
				}
			}
			if (dates.length === 0) {
				isSelected = false;
			}
			return isSelected;
		},
		isRowSelected(rowIndex) {
			let dates = this.getRowDateByRowIndex(rowIndex);
			let isSelected = true;
			for (let i = 0; i < dates.length; i++) {
				if (!dates[i].selected) {
					isSelected = false;
					break;
				}
			}
			if (dates.length === 0) {
				isSelected = false;
			}
			return isSelected;
		},
		checkEveryDaySelected() {
			let vm = this;
			vm.WEEKS.forEach((item, index) => {
				item.selected = vm.isColumnSelected(index);
			});
			for (let i = 0; i < vm.rowSelected.length; i++) {
				vm.rowSelected[i] = vm.isRowSelected(i);
			}
		}
	},
	watch: {
		WEEKS: {
			handler: function(datas) {
				let isAllColSelected = true;
				let isAllRowSelected = true;
				for (let i = 0; i < datas.length; i++) {
					if (!datas[i].selected) {
						isAllColSelected = false;
						break;
					}
				}
				for (let i = 0; i < this.rowSelected.length; i++) {
					let rowDates = this.getRowDateByRowIndex(i);
					if (!this.rowSelected[i] && rowDates.length > 0) {
						isAllRowSelected = false;
						break;
					}
				}
				this.isAllDaysSelected = isAllColSelected && isAllRowSelected;
			},
			deep: true
		},
		rowSelected: {
			handler: function(datas) {
				let isAllColSelected = true;
				let isAllRowSelected = true;
				for (let i = 0; i < datas.length; i++) {
					let rowDates = this.getRowDateByRowIndex(i);
					if (!datas[i] && rowDates.length > 0) {
						isAllRowSelected = false;
						break;
					}
				}
				for (let i = 0; i < this.WEEKS.length; i++) {
					if (!this.WEEKS[i].selected) {
						isAllColSelected = false;
						break;
					}
				}
				this.isAllDaysSelected = isAllColSelected && isAllRowSelected;
			},
			deep: true
		},
		selectDays: {
			handler: function(val) {
				if (val.length === 0) {
					this.rowSelected = [false,false,false,false,false,false];
					this.WEEKS.forEach((item, index) => {
						item.selected = false;
					});
					this.isAllDaysSelected = false;
				}
			},
			deep: true
		},
		year: function(val) {
			this.checkEveryDaySelected();
		},
		month: function(val) {
			this.checkEveryDaySelected();
		}
	}
};
</script>
<style scoped>
.rich-calander-table{width: 100%;font-size: 14px;line-height: 28px;color: #414449; margin-top: 10px;}
.rich-calander-table{
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.rich-calander-table th{
	cursor: pointer;
	background: #F5F6F8
}
.rich-calander-table th:nth-child(1) {
	background: #F5F6F8;
}
.rich-calander-table td:nth-child(1) {
	background: #F5F6F8;
}
.rich-calander-table th.col-selected, .rich-calander-table td.row-selected{
	background: #e4e8f1;
}

.rich-calander-table td{
	width: 28px;
    height: 28px;
    box-sizing: border-box;
    text-align: center;
    cursor: pointer;
}

.rich-calander-table .prev-month,.rich-calander-table .next-month{
	color: #ddd;
}

td.disabled {
    background-color: #f4f4f4;
    opacity: 1;
    cursor: not-allowed;
    color: #ccc;
}
.rich-calander-table .available:hover{background-color: #e4e8f1}
.rich-calander-table .available.today{background-color: #e4e8f1}
.rich-calander-table .available.selected{background: #d30511;color: #fff;}
</style>