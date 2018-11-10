import * as React from 'react';
import { cn } from '@bem-react/classname';
import {IeventItemType} from '../../../server/types';
import PanelHeader from './Header/Panel-Header';
import PanelAction from './Action/Panel-Action';
import './Panel.styl';

type PanelType = {
  item: IeventItemType,
  className?: string,
}

const cnPanel = cn('Panel');

const Panel = ({ item, className }: PanelType) => (
  <article className={cnPanel(
    {
      size: item.size,
      type: item.type,
      hasContent: !!item.description || !!item.data,
    },
    [className],
  )}>
    <PanelHeader item={item} />

    <PanelAction
      type="arrow"
      white={item.type === 'critical' && !(item.data || item.description)}
    />
    <PanelAction
      type="close"
      white={item.type === 'critical'}
    />
  </article>
);

export default Panel;