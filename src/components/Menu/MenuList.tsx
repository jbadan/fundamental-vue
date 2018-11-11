import { componentName } from '@/util';
import { Component, Inject, Vue, Prop } from 'vue-property-decorator';
import { MenuItem } from './MenuItem';
import { Menu } from './Menu';
import { API } from '@/api';
import { MENU, MENU_LIST } from './types';

const name = componentName('menu-item-list');

@Component({
  name,
  provide() {
    return {
      [MENU_LIST]: this,
    };
  },
})
@API.Component('Menu List', comp => {
  comp.
    addEvent('select', 'Sent when a menu item was selected', event => {
      event.string('value');
    });
})
export class MenuList extends Vue {
  @Prop({ type: String, required: false, default: null })
  @API.Prop('header', build => {
    build
      .describe('text displayed in the menu list (group) header')
      .type(Boolean);
  })
  public header!: string | null;

  @Inject({ from: MENU, default: null }) public menu!: Menu | null;

  public render() {
    const items = this.$slots.default;
    const renderList = () => <ul class='fd-menu__list'>{items}</ul>;
    const header = this.header;
    if (header == null) {
      return renderList();
    }
    return (
      <div class='fd-menu__group'>
        <h1 class='fd-menu__title'>{header}</h1>
        {renderList()}
      </div>
    );
  }

  public menuItemDidClick(item: MenuItem) {
    this.$emit('select', item.value);
    const menu = this.menu;
    if (menu) {
      menu.menuItemDidClick(item);
    }
  }
}