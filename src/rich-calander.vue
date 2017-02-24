<template>
	<div>
		<div class="rich-calander_selected-box">
			<div class="setting-header">
				<span class="header-day">共 {{ dayLength }} 天</span>
				<span class="header-del" @click="clearScheduleList"><em class="icon icon-delete"></em>全部删除</span>
				<span class="header-calendar">
					<em class="icon icon-calendar" @click="showPicker = !showPicker"></em>
				</span>
			</div>
			<div class="rich-calander_selected-list">
				<ul>
					<li v-for="item in scheduleList"> {{ item }}</li>
				</ul>
			</div>
		</div>
		<ui-date-picker v-model='daysArray' :isClearList="isClearList"></ui-date-picker>
	</div>
</template>
<script>
import { formatDate } from '../utils/common.js';
import UiDatePicker from './date-picker.vue';

export default {
	name: 'UiRichCalander',
	data() {
		return {
			daysArray: [],
			showPicker: false,
			isClearList: false
		};
	},
	props: {
		value: {
			type: Array,
			required: true
		}
	},
	components: {
		UiDatePicker
	},
	created() {
		this.daysArray = this.value;
	},
	computed: {
		scheduleList() {
			const listArray = [];
			for (let i = 0; i < this.daysArray.length; i++) {
				let listItem = this.daysArray[i];
				if (listItem.length == 1) {
					listArray.push(formatDate(listItem[0],'yyyy-MM-dd'));
				} else {
					listArray.push(`${formatDate(listItem[0], 'yyyy-MM-dd')} 至 ${formatDate(listItem[1], 'yyyy-MM-dd')}`);
				}
			}
			return listArray;
		},
		dayLength() {
			let length = 0;
			for (let i = 0; i < this.daysArray.length; i++) {
				let listItem = this.daysArray[i];
				if (listItem.length == 1) {
					length += 1;
				} else {
					let count = ((listItem[1] - listItem[0]) / 86400000) + 1;
					length += count;
				}
			}
			return length;
		}
	},
	methods: {
		clearScheduleList() {
			this.isClearList = true;
		}
	},
	watch: {
		daysArray: {
			handler: function(val) {
				this.$emit('input', val);
				this.isClearList = false;
			},
			deep: true
		}
	}
};
</script>
<style scoped>
* {padding: 0; margin: 0; box-sizing: border-box;}
ul, li {list-style: none}
.rich-calander_selected-box {
    margin-left: 0px;
    border: 1px solid #edf0f2;
    background: #f7f9fa;
    width: 470px;
}
.rich-calander_selected-box .setting-header {
    height: 40px;
    line-height: 40px;
    padding: 0px 10px;
    background: #eaedf0;
}
.rich-calander_selected-box .setting-header .header-del {
    margin-left: 20px;
    color: #1197ed;
    cursor: pointer;
}
.rich-calander_selected-box .setting-header .header-del .icon {
    margin-top: -2px;
    font-size: 14px;
}
.rich-calander_selected-box .setting-header .header-calendar {
    float: right;
    color: #1197ed;
    cursor: pointer;
}
.rich-calander_selected-box .rich-calander_selected-list {
    padding: 5px 10px;
    line-height: 24px;
    font-size: 14px;
    color: #596069;
}
.rich-calander_selected-list {
    width: 468px;
    height: 154px;
    overflow: auto;
}
</style>