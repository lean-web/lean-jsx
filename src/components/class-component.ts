export abstract class Component<Props extends object = object>
  implements SXL.ClassComponent<Props & SXL.Props>
{
  props: Props & SXL.Props;
  constructor(props: Props & SXL.Props) {
    this.props = props;
  }
  abstract render(): SXL.StaticElement | SXL.AsyncElement;
}
