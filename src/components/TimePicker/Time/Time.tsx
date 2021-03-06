import { Component, Prop, Event } from '@/core';
import { TimeAction } from './TimeAction';
import { TimeInput } from './TimeInput';
import { Watch } from 'vue-property-decorator';
import { TimeRangeMixin } from '../mixins/TimeRange';
import { mixins } from 'vue-class-component';

interface Props {
  type?: TimeType;
  value?: string | number;
  ariaLabel?: string | null;
  placeholder?: string;
}

// Time type
const typeMapping = {
  hour24: '24 Hour range',
  hour12: '12 Hour range',
  minute: 'Minute range',
  second: 'Second range',
  meridian: 'am/pm meridian range',
};
export type TimeType = keyof (typeof typeMapping);
export const TimeTypeList = Object.keys(typeMapping) as TimeType[];

const TimeBase = mixins(TimeRangeMixin);

@Component('Time')
@Event('timeUpdate', 'Event triggered when the time value is updated')
export class Time extends TimeBase<Props> {
  @Prop('Time Item Type', {
    type: String,
    required: true,
    acceptableValues: TimeTypeList,
    validator: TimeTypeList.includes,
  })
  public type!: TimeType;

  @Prop('Value in the Time input field', {
    type: [String, Number],
    default: '',
  })
  public value!: string | number;

  @Prop('Aria Label', {
    type: String,
    default: 'Time Item',
  })
  public ariaLabel!: string | null;

  @Prop('Placeholder for the Time component', {
    type: String,
    default: '',
  })
  public placeholder!: string;

  public $tsxProps!: Readonly<{}> & Readonly<Props>;
  private inputValue: string | number = this.value;

  private get previousValue() {
    const previousValue = Number(this.inputValue) > Number(this.range[this.type].min) ? Number(this.inputValue) - 1 : this.range[this.type].max;
    return previousValue.toString().padStart(2, '0');
  }

  private get nextValue() {
    const nextValue = Number(this.inputValue) < Number(this.range[this.type].max) ? Number(this.inputValue) + 1 : this.range[this.type].min;
    return nextValue.toString().padStart(2, '0');
  }

  private decreaseValue() {
    let value: string;
    let isValInRange: boolean;
    if (this.type === 'hour24' || this.type === 'hour12' || this.type === 'minute' || this.type === 'second') {
      value = !isNaN(Number(this.inputValue)) ? this.previousValue : this.range[this.type].min;
      isValInRange = this.checkValueRange(value, this.type);
      value = isValInRange ? value : this.range[this.type].min;
    } else if (this.type === 'meridian') {
      value = this.inputValue.toString().toLowerCase() === this.range[this.type].min ? this.range[this.type].max : this.range[this.type].min;
    } else {
      value = '';
    }
    this.inputValue = value;
    this.$emit('update:value', this.inputValue);
    this.emitTimeUpdate();
  }

  private increaseValue() {
    let value: string;
    if (this.type === 'hour24' || this.type === 'hour12' || this.type === 'minute' || this.type === 'second') {
      value = !isNaN(Number(this.inputValue)) ? this.nextValue : this.range[this.type].min;
    } else if (this.type === 'meridian') {
      value = this.inputValue.toString().toLowerCase() === this.range[this.type].min ? this.range[this.type].max : this.range[this.type].min;
    } else {
      value = '';
    }
    this.inputValue = value;
    this.$emit('update:value', this.inputValue);
    this.emitTimeUpdate();
  }

  private emitTimeUpdate() {
    this.$emit('timeUpdate', this.inputValue);
  }

  @Watch('value')
  public handleNewValue(newValue: string) {
    this.inputValue = newValue;
    this.$emit('input', this.inputValue);
  }

  private sanitizeValue() {
    let value: string | number;
    let isValInRange: boolean;
    if (this.type === 'hour24' || this.type === 'hour12' || this.type === 'minute' || this.type === 'second') {
      isValInRange = this.checkValueRange(this.inputValue, this.type);
      value = isValInRange ? this.inputValue : '';
    } else if (this.type === 'meridian') {
      const meridian = this.inputValue.toString().toLowerCase();
      value = (meridian === this.range[this.type].min || meridian === this.range[this.type].max) ? meridian : '';
    } else {
      value = '';
    }
    this.inputValue = value;
    this.$emit('update:value', this.inputValue);
  }

  private timeUpdate(newValue: string) {
    if (this.type === 'meridian' && (newValue !== this.range[this.type].min && newValue !== this.range[this.type].max)) {
    this.inputValue = '';
    } else {
      this.inputValue = newValue;
    }

    this.emitTimeUpdate();
  }

  public render() {
    this.sanitizeValue();
    return (
      <div class='fd-time__item' aria-label={this.ariaLabel}>
        <TimeAction
          icon='navigation-up-arrow'
          type='standard'
          on-click={this.increaseValue}></TimeAction>
        <TimeInput value={this.inputValue} on-input={this.timeUpdate} placeholder={this.placeholder}></TimeInput>
        <TimeAction
          icon='navigation-down-arrow'
          type='standard'
          on-click={this.decreaseValue}></TimeAction>
      </div>
    );
  }
}
