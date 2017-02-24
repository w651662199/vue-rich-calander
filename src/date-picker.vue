<template>
<transition name="el-zoom-in-top">
	<div class="rich-calander-box">
	    <div class="rich-calander-box-item item-left">
	        <div class="calander-box_item-content">
	            <div class="calander-box_item-content-header">
	            	<div class="rich-calander_arrow-left" @click="handleMonthChange(-1)">
						<span class="rich-calander_arrow-line"></span>
						<span class="rich-calander_arrow-line"></span>
					</div>
	                <div class="calander-box_time-text">
	                    <div class="calander-box_select">
	                    	<span class="select-text">{{year}}</span>
	                    </div>
	                    <div class="calander-box_select">
	                    	<span class="select-text">{{month + 1}}</span>
	                    </div>
	                </div>
	                <div class="rich-calander_arrow-right" @click="handleMonthChange(1)">
						<span class="rich-calander_arrow-line"></span>
						<span class="rich-calander_arrow-line"></span>
					</div>
	            </div>
	            <ui-date-table :year="year" :month="month" :selectDays="selectDays" @pick="handleItemClick"></ui-date-table>
	        </div>
	    </div>
	    <div class="rich-calander-box-item item-right">
        <div class="calander-box_item-content">
            <div class="calander-box_item-content-header">
            	<div class="rich-calander_arrow-left" @click="handleMonthChange(-1)">
					<span class="rich-calander_arrow-line"></span>
					<span class="rich-calander_arrow-line"></span>
				</div>
                <div class="calander-box_time-text">
                    <div class="calander-box_select"><span class="select-text">{{nextYear}}</span></div>
                    <div class="calander-box_select"><span class="select-text">{{nextMonth + 1}}</span></div>
                </div>
                <div class="rich-calander_arrow-right" @click="handleMonthChange(1)">
					<span class="rich-calander_arrow-line"></span>
					<span class="rich-calander_arrow-line"></span>
				</div>
            </div>
            <ui-date-table :year="nextYear" :month="nextMonth" :selectDays="selectDays" @pick="handleItemClick"></ui-date-table>
        </div>
    </div>
</transition>
</template>
<script>
import { getDayCountOfMonth, DAY_DURATION } from '../utils/common.js';
import UiDateTable from './date-table.vue';
export default{
	name: 'UiDatePicker',
	props: {
		value: {
			type: Array,
			required: true
		},
		isClearList: {
			type: Boolean
		},
		visibleYearListLength: {
			type: Number,
			default: 5
		}
	},
	data() {
		return {
			year: new Date().getFullYear(),
			month: new Date().getMonth(),
			days: [],
			monthList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
			dropDownVisible: {
				leftYear: false,
				leftMonth: false,
				rightYear: false,
				rightMonth: false
			}
		};
	},
	components: {
		UiDateTable
	},
	computed: {
		nextYear() {
			return this.month === 11 ? this.year + 1 : this.year;
		},
		nextMonth() {
			return this.month === 11 ? 0 : this.month + 1;
		},
		yearList() {
			let list = [];
			for (let i = 0; i < this.visibleYearListLength; i++) {
				list.push(this.year + i);
			}
			return list;
		},
		selectDays() {
			const sortedDays = this.days.sort(function(a, b) {
				return a - b;
			});
			let arr = [];
			let tempArr = [];
			let isContinuous = false;
			for(let i = 0;i<sortedDays.length;i++) {
			    let item1 = sortedDays[i];
			    let item2 = i == sortedDays.length ? sortedDays[i] : sortedDays[i+1];
			    if (item1 + DAY_DURATION == item2) {
			        if (!isContinuous) {
			            tempArr.push(item1);
			        }
			        isContinuous = true;
			        continue;
			    } else {
			        isContinuous = false;
			        tempArr.push(item1);
			    }
			    if (!isContinuous) {
			        arr.push(tempArr);
			        tempArr = [];
			    }
			}
			return arr;
			// return this.value;
		}
	},
	created() {
		this.days = this.getDays(this.value);
	},
	methods: {
		handleDropDown(type) {
			if (type === 0) {
				this.dropDownVisible.leftYear = !this.dropDownVisible.leftYear;
			} else if (type === 1) {
				this.dropDownVisible.leftMonth = !this.dropDownVisible.leftMonth;
			} else if (type === 2) {
				this.dropDownVisible.rightYear = !this.dropDownVisible.rightYear;
			} else if (type === 3) {
				this.dropDownVisible.rightMonth = !this.dropDownVisible.rightMonth;
			}
		},
		handleSelectYear(year) {
			this.year = year;
			this.dropDownVisible.leftYear = false;
			this.dropDownVisible.rightYear = false;
		},
		getDays(datesArr) {
			let arr = [];
			for (let i = 0; i < datesArr.length; i++) {
				let dateArrItem = datesArr[i];
				if (dateArrItem.length === 1) {
					arr.push(dateArrItem[0]);
				} else {
					for (let t = dateArrItem[0]; t <= dateArrItem[1]; t += DAY_DURATION) {
						arr.push(t);
					}
				}
			}
			return arr;
		},
		handleItemClick(item) {
			let dateTime = new Date(item.year,item.month,item.date).getTime();
			const index =  this.days.findIndex(function(value,index,arr) {
				return value == dateTime;
			});
			if (index != -1) {
				this.days.splice(index,1);
			} else {
				this.days.push(dateTime);
			}
		},
		handleMonthChange(type) {
			let destMonth = this.month;
			if (type === 1) { //next
				this.year = this.month === 11 ? this.year + 1 : this.year;
				this.month = this.month === 11 ? 0 : this.month + 1;
			} else { //pre
				this.year = this.month === 0 ? this.year - 1 : this.year;
				this.month = this.month === 0 ? 11 : this.month - 1;
			}
		}
	},
	watch: {
		days: {
			handler: function(val) {
				this.$emit('input', this.selectDays);
			},
			deep:true
		},
		isClearList: function(val) {
			if (val) {
				this.days = [];
			}
		}
	}
};
</script>
<style scoped>
* {padding: 0; margin: 0; box-sizing: border-box;}
.rich-calander-box-item{
	width: 230px;
	height: 246px;
	float: left;
	background: #fff;
	-webkit-box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
	box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
	-webkit-border-radius: 6px;
	border-radius: 6px;
	-webkit-box-sizing: border-box;
	border: 1px solid #EAEAEA;
}
.rich-calander-box-item.item-left{margin-right: 10px;}
.calander-box_item-content{padding: 10px;}
.calander-box_item-content .calander-box_item-content-header{height: 20px;text-align: center;font-size:0;}
.calander-box_item-content .calander-box_item-content-body{margin-top:10px;}
.calander-box_item-content-header button{
	font-size: 12px;
    color: #97a8be;
    border: 0;
    background: transparent;
    cursor: pointer;
    outline: none;
    margin-top: 3px;
}
button.prev{float: left;}
button.next{float: right;}
button.prev:before{content: '\e906';}
button.next:before{content: '\e907';}
.calander-box_time-text{display: inline-block;height: 20px; font-size:0;}

.calander-box_select {
    width: 70px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    background: #e4e8f1;
    -webkit-border-radius: 2px;
    border-radius: 2px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0 10px;
    color: #23262b;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    cursor: pointer;
    font-size: 14px;
}
.calander-box_select:first-child{margin-right: 10px;}
.calander-box_select:last-child{margin-right: 0;}

.el-zoom-in-top-enter-active,
.el-zoom-in-top-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1) 100ms, opacity 300ms cubic-bezier(0.23, 1, 0.32, 1) 100ms;
  transform-origin: center top;
}
.el-zoom-in-top-enter,
.el-zoom-in-top-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
.calander-box_select-dialog {
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 1100;
    -webkit-box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
    -webkit-border-radius: 6px;
    border-radius: 6px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    max-height: 130px;
    overflow: auto;
}
.calander-box_select .calander-box_select-dialog {top: 24px; width: 100%; background: #fff;}
.calander-box_select-dialog ul li {
    overflow: hidden;
    display: block;
    padding: 0px 10px;
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    white-space: nowrap;
    color: #596069;
}
.calander-box_select .dialog-white ul li:hover {
    color: #23272c;
    background: #f0f3f6;
}
.calander-box_select .dialog-white ul li.actived {
    color: #596069;
    background: #f0f3f6;
}
.rich-calander_arrow-left, .rich-calander_arrow-right{position: relative; cursor: pointer; margin-top: 5px; width: 14px; height: 14px; display: inline-block;}
.rich-calander_arrow-left {float: left;}
.rich-calander_arrow-right {float: right;}
.rich-calander_arrow-line{display: inline-block; width: 12px;height: 2px;border-radius: 2px;background: #888;  position: absolute; top: 8px; left: 0;}
.rich-calander_arrow-left .rich-calander_arrow-line{transform: rotate(50deg);}
.rich-calander_arrow-left .rich-calander_arrow-line:first-child{transform: rotate(-50deg); top: 0;}
.rich-calander_arrow-right .rich-calander_arrow-line{transform: rotate(-50deg);}
.rich-calander_arrow-right .rich-calander_arrow-line:first-child{transform: rotate(50deg); top: 0;}

::-webkit-scrollbar {
  width: 8px;
  height: 8px; }

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px transparent;
  border-radius: 5px;
  background: transparent; }

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.1); }

::-webkit-scrollbar-thumb:hover {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.3); }

</style>