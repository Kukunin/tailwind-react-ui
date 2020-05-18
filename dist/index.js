import merge from 'lodash.merge';
import paramCase from 'param-case';
import includes from 'lodash.includes';
import uniqueId from 'lodash.uniqueid';
import { Transition } from 'react-transition-group';
import get from 'lodash.get';
import classnames from 'classnames';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var defaultTheme = {
  prefix: '',
  radius: 'rounded',
  spacing: {
    zero: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12
  },
  container: {
    sm: 'xl',
    md: '3xl',
    lg: '4xl'
  },
  text: {
    size: {
      body: ['sm', 'base', 'lg'],
      title: ['lg', 'xl', '2xl', '3xl', '4xl', '5xl']
    },
    family: {
      body: 'sans',
      subtitle: 'sans',
      title: 'sans'
    }
  },
  brandColors: {
    primary: 'blue',
    secondary: 'grey-dark',
    success: 'green',
    danger: 'red',
    warning: 'orange-light',
    info: 'blue-lighter'
  },
  textColors: {
    body: 'grey-darkest',
    link: 'blue-dark',
    linkDark: 'blue-darker',
    emphasis: 'black',
    on: {
      primary: 'white',
      secondary: 'white',
      success: 'white',
      danger: 'white',
      warning: 'black',
      info: 'black',
      dark: 'white'
    }
  },
  surfaceColors: {
    default: 'white',
    dark: 'grey-darker',
    light: 'grey-lightest'
  },
  highlightOffset: 1,
  accentSize: 4,
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px'
  }
};

var TailwindTheme = React.createContext(defaultTheme);

const TailwindThemeProvider = ({
  theme,
  children
}) => {
  const mergedTheme = merge(defaultTheme, theme);
  return /*#__PURE__*/React.createElement(TailwindTheme.Provider, {
    value: mergedTheme
  }, children);
};

TailwindThemeProvider.displayName = "TailwindThemeProvider";
TailwindThemeProvider.propTypes = {
  theme: PropTypes.shape({}),
  children: PropTypes.node
};
TailwindThemeProvider.defaultProps = {
  theme: {},
  children: undefined
};

const withTheme = Component => {
  const WithTheme = props => /*#__PURE__*/React.createElement(TailwindTheme.Consumer, null, theme => /*#__PURE__*/React.createElement(Component, _extends({}, props, {
    theme: theme
  })));

  WithTheme.displayName = `WithTheme(${Component.displayName})`;
  return WithTheme;
};

const shades = ['lightest', 'lighter', 'light', 'base', 'dark', 'darker', 'darkest'];
var getColorShade = ((color, offset = 1) => {
  if (!color) {
    return false;
  }

  if (offset === 0) return color;
  let currentColor = color === 'white' ? ['grey', 'lightest'] : color.split('-');
  let shadeOffset = offset;

  if (color === 'white') {
    if (shadeOffset < 1) return color;
    if (shadeOffset === 1) return 'grey-lightest';
    currentColor = ['grey', 'lightest'];
    if (typeof shadeOffset === 'number') shadeOffset = offset - 1;
  }

  if (currentColor.length === 1) {
    currentColor.push('base');
  }

  if (typeof shadeOffset === 'string') {
    return `${currentColor[0]}-${shadeOffset}`;
  }

  const shadeIndex = Math.min(Math.max(shades.indexOf(currentColor[1]) + shadeOffset, 0), shades.length - 1);
  const newShade = shades[shadeIndex];
  return `${currentColor[0]}${newShade === 'base' ? '' : `-${newShade}`}`;
});

const getArray = value => Array.isArray(value) ? value : [value];

const splitProp = prop => {
  const utility = prop.substring(prop.indexOf(':') + 1);
  return prop.indexOf(':') !== -1 ? {
    utility,
    variant: prop.substring(0, prop.indexOf(':'))
  } : {
    utility
  };
};

const createClassName = ({
  utility,
  value,
  variant,
  prefix = ''
}) => `${variant ? `${variant}:` : ''}${prefix}${utility}${value !== false && value !== undefined ? `-${value}` : ''}`;

var tailwindPropToClassName = ((prop, values, prefix) => {
  const propType = typeof values;
  if (!propType) return '';
  const {
    utility,
    variant
  } = splitProp(prop);

  if (propType === 'boolean') {
    return createClassName({
      utility,
      variant,
      prefix
    });
  }

  if (propType === 'object' && !Array.isArray(values)) {
    return Object.keys(values).map(key => createClassName({
      prefix,
      utility: `${utility}${key}`,
      variant,
      value: values[key]
    }));
  }

  return getArray(values).map(value => {
    if (value === false || typeof value === 'undefined') {
      return '';
    }

    if (typeof value === 'boolean') {
      return createClassName({
        utility,
        variant,
        prefix
      });
    }

    return createClassName({
      prefix,
      utility,
      variant,
      value: utility !== value ? value : undefined
    });
  }).filter(value => !!value).join(' ');
});

const display = {
  block: PropTypes.bool,
  hidden: PropTypes.bool,
  inline: PropTypes.bool,
  inlineBlock: PropTypes.bool,
  table: PropTypes.bool,
  tableCell: PropTypes.bool,
  tableRow: PropTypes.bool
};
const floats = {
  clearfix: PropTypes.bool,
  float: PropTypes.oneOf(['none', 'right', 'left'])
};
const overflow = {
  overflow: PropTypes.oneOf(['hidden', 'auto', 'scroll']),
  overflowX: PropTypes.oneOf(['hidden', 'auto', 'scroll']),
  overflowY: PropTypes.oneOf(['hidden', 'auto', 'scroll'])
};
const position = {
  absolute: PropTypes.bool,
  fixed: PropTypes.bool,
  pin: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['t', 'r', 'b', 'l', 'y', 'x', 'none']), PropTypes.array]),
  relative: PropTypes.bool,
  static: PropTypes.bool
};
const zIndex = {
  z: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
const typography = {
  align: PropTypes.string,
  break: PropTypes.oneOf(['words', 'normal']),
  capitalize: PropTypes.bool,
  font: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  italic: PropTypes.bool,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  tracking: PropTypes.string,
  leading: PropTypes.string,
  lineThrough: PropTypes.bool,
  lowercase: PropTypes.bool,
  normalCase: PropTypes.bool,
  noUnderline: PropTypes.bool,
  roman: PropTypes.bool,
  truncate: PropTypes.bool,
  underline: PropTypes.bool,
  uppercase: PropTypes.bool,
  whitespace: PropTypes.oneOf(['normal', 'no-wrap', 'pre', 'pre-line', 'pre-wrap'])
};
const backgrounds = {
  bg: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};
const borders = {
  border: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.array]),
  borderB: PropTypes.number,
  borderL: PropTypes.number,
  borderR: PropTypes.number,
  borderT: PropTypes.number,
  rounded: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedB: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedBl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedBr: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedL: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedR: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedT: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedTl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  roundedTr: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
const flexValues = [true, 'row', 'row-reverse', 'col', 'col-reverse', 'no-wrap', 'wrap', 'wrap-reverse', 'initial', 1, 'auto', 'none', 'grow', 'shrink', 'no-grow', 'no-shrink'];
const flexAlignment = ['start', 'center', 'end'];
const flex = {
  content: PropTypes.oneOf([...flexAlignment, 'between', 'around']),
  flex: PropTypes.oneOfType([PropTypes.oneOf(flexValues), PropTypes.arrayOf(PropTypes.oneOf(flexValues))]),
  inlineFlex: PropTypes.bool,
  items: PropTypes.oneOf([...flexAlignment, 'stretch', 'baseline']),
  self: PropTypes.oneOf([...flexAlignment, 'auto', 'stretch']),
  justify: PropTypes.oneOf([...flexAlignment, 'between', 'around'])
};
const spacingShape = {
  t: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  r: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  b: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  l: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  y: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
const spacing = {
  m: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.shape(spacingShape)]),
  nm: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.shape(spacingShape)]),
  p: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.shape(spacingShape)])
};
const sizing = {
  h: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxH: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minH: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxW: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minW: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  w: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
const misc = {
  opacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  shadow: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  listReset: PropTypes.bool,
  outline: PropTypes.string,
  appearance: PropTypes.string,
  select: PropTypes.string,
  pointerEvents: PropTypes.string,
  fill: PropTypes.string
};
const plugins = {
  visuallyHidden: PropTypes.bool,
  visuallyHiddenFocusable: PropTypes.bool,
  container: PropTypes.bool
};
const propTypes = _extends(_extends(_extends(_extends(_extends(_extends(_extends(_extends(_extends(_extends(_extends(_extends(_extends({}, display), floats), overflow), position), zIndex), typography), backgrounds), borders), flex), spacing), sizing), misc), plugins);
const propVariants = ['hover', 'focus', 'hocus', 'sm', 'md', 'lg', 'xl'];
var tailwindProps = [...Object.keys(propTypes), ...propVariants.reduce((variantProps, variant) => [...variantProps, ...Object.keys(propTypes).map(prop => `${prop}-${variant}`)], [])];

/* eslint-disable react/destructuring-assignment */

const hasUpperCase = str => str.toLowerCase() !== str;

var getTailwindClassNames = ((props, {
  ignore = [],
  prefix
} = {}) => !!props && Object.keys(props).reduce((twClasses, key) => {
  if (ignore.includes(key) || props[key] === false || typeof props[key] === 'undefined') return twClasses;
  let type = key.indexOf('-') > 0 ? key.substring(0, key.indexOf('-')) : key;
  const variant = key.indexOf('-') > 0 ? key.substring(key.indexOf('-') + 1) : key;
  if (!tailwindProps.includes(type)) return twClasses;

  if (hasUpperCase(type)) {
    type = paramCase(type);
  }

  if (propVariants.includes(variant)) {
    if (variant === 'hocus') {
      return [...twClasses, tailwindPropToClassName(`hover:${type}`, props[key], prefix), tailwindPropToClassName(`focus:${type}`, props[key], prefix)];
    }

    return [...twClasses, tailwindPropToClassName(`${variant}:${type}`, props[key], prefix)];
  }

  return [...twClasses, tailwindPropToClassName(type, props[key], prefix)];
}, []));

var getAsArray = (value => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
});

var filterProps = ((componentProps, filterList) => Object.keys(componentProps).reduce((newProps, prop) => {
  if (includes(filterList, prop)) {
    return newProps;
  }

  return _extends(_extends({}, newProps), {}, {
    [prop]: componentProps[prop]
  });
}, {}));

var getUniqueID = (prefix => uniqueId(`${prefix}-`));

const withTheme$1 = (Component, _ref) => {
  let {
    inState
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["inState"]);

  const WithTransition = componentProps => /*#__PURE__*/React.createElement(Transition, _extends({
    in: get(componentProps, inState),
    timeout: 0
  }, rest), state => /*#__PURE__*/React.createElement(Component, _extends({}, componentProps, {
    transition: state
  })));

  WithTransition.displayName = `WithTransition(${Component.displayName})`;
  return WithTransition;
};

const withTailwind = (Component, {
  ignore = []
} = {}) => {
  const WithTailwind = (_ref) => {
    let {
      className
    } = _ref,
        props = _objectWithoutPropertiesLoose(_ref, ["className"]);

    return /*#__PURE__*/React.createElement(Component, _extends({}, filterProps(props, tailwindProps.filter(prop => !ignore.includes(prop))), {
      className: classnames([getTailwindClassNames(props, {
        ignore
      }), className])
    }));
  };

  WithTailwind.displayName = `WithTailwind(${Component.displayName})`;
  WithTailwind.propTypes = _extends({
    className: PropTypes.string
  }, propTypes);
  WithTailwind.defaultProps = {
    className: undefined
  };
  return WithTailwind;
};

var useThemeValue = ((prefix, value, userClassNames = '') => {
  if (userClassNames.includes(prefix)) {
    return false;
  }

  return tailwindPropToClassName(prefix, value);
});

const Base = (_ref) => {
  let {
    theme,
    is,
    children,
    className,
    innerRef
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children", "className", "focusable", "innerRef"]);

  const Component = is;
  return /*#__PURE__*/React.createElement(Component, _extends({}, filterProps(rest, tailwindProps), {
    className: classnames(getTailwindClassNames(_extends(_extends({}, rest), {}, {
      'outine-focus': 'none',
      'shadow-focus': 'outline'
    }), {
      prefix: theme.prefix
    }), className),
    ref: innerRef
  }), children);
};

Base.displayName = "Base";
Base.propTypes = _extends({
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  className: PropTypes.string,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
}, propTypes);
Base.defaultProps = {
  is: 'div',
  children: undefined,
  className: undefined,
  innerRef: undefined
};
var Base$1 = withTheme(Base);

const Box = (_ref) => {
  let {
    is,
    children,
    inline,
    inlineBlock
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children", "inline", "inlineBlock"]);

  const el = is === 'div' && (inline || inlineBlock) ? 'span' : is;
  return /*#__PURE__*/React.createElement(Base$1, _extends({
    is: el,
    inline: inline,
    inlineBlock: inlineBlock
  }, rest), children);
};

Box.displayName = "Box";
Box.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  inline: PropTypes.bool,
  inlineBlock: PropTypes.bool
};
Box.defaultProps = {
  is: 'div',
  children: undefined,
  inline: false,
  inlineBlock: false
};

const Flex = (_ref) => {
  let {
    is,
    children,
    inline,
    inlineFlex,
    col,
    reverse,
    wrap,
    wrapReverse
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children", "inline", "inlineFlex", "col", "reverse", "wrap", "wrapReverse"]);

  const el = is === 'div' && (inline || inlineFlex) ? 'span' : is;
  const flex = [true];

  if (col) {
    flex.push(reverse ? 'col-reverse' : 'col');
  } else if (reverse) {
    flex.push('row-reverse');
  }

  if (wrap || wrapReverse) {
    flex.push(wrap ? 'wrap' : 'wrap-reverse');
  }

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: el,
    flex: flex,
    inlineFlex: inline || inlineFlex
  }, rest), children);
};

Flex.displayName = "Flex";
Flex.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  inline: PropTypes.bool,
  inlineFlex: PropTypes.bool,
  col: PropTypes.bool,
  reverse: PropTypes.bool,
  wrap: PropTypes.bool,
  wrapReverse: PropTypes.bool
};
Flex.defaultProps = {
  is: 'div',
  children: undefined,
  inline: false,
  inlineFlex: false,
  col: false,
  reverse: false,
  wrap: false,
  wrapReverse: false
};

const Image = (_ref) => {
  let {
    is,
    children,
    aspectRatio,
    bg,
    w,
    text
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children", "aspectRatio", "bg", "w", "text"]);

  return /*#__PURE__*/React.createElement(Box, {
    relative: true,
    w: w,
    text: text
  }, /*#__PURE__*/React.createElement(Box, {
    bg: bg,
    style: {
      paddingBottom: `${100 / aspectRatio}%`
    }
  }), /*#__PURE__*/React.createElement(Base$1, _extends({
    is: is,
    absolute: true,
    pin: true,
    w: "full"
  }, rest)), children && /*#__PURE__*/React.createElement(Box, {
    absolute: true,
    pin: true,
    flex: true,
    items: "end"
  }, children));
};

Image.displayName = "Image";
Image.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  aspectRatio: PropTypes.number,
  bg: propTypes.bg,
  w: propTypes.w,
  text: propTypes.text
};
Image.defaultProps = {
  is: 'img',
  aspectRatio: 1,
  children: undefined,
  bg: 'grey-light',
  w: 'full',
  text: undefined
};

const Text = (_ref) => {
  let {
    children,
    is,
    bold,
    font,
    text,
    color,
    size,
    weight,
    tight,
    loose,
    leading
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["children", "is", "bold", "font", "text", "color", "size", "weight", "tight", "loose", "leading"]);

  const fontValue = [...getAsArray(font), bold ? 'bold' : weight];
  const textValue = [...getAsArray(text), color, size];
  let leadingValue = leading;

  if (tight || loose) {
    leadingValue = tight ? 'tight' : 'loose';
  }

  return /*#__PURE__*/React.createElement(Base$1, _extends({
    is: is,
    font: fontValue.filter(value => !!value),
    text: textValue.filter(value => !!value),
    leading: leadingValue
  }, rest), children);
};

Text.displayName = "Text";
Text.propTypes = {
  children: PropTypes.node,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  font: propTypes.font,
  text: propTypes.text,
  bold: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.string,
  weight: PropTypes.string,
  leading: propTypes.leading,
  tight: PropTypes.bool,
  loose: PropTypes.bool
};
Text.defaultProps = {
  children: undefined,
  is: 'span',
  font: undefined,
  text: undefined,
  bold: false,
  color: undefined,
  size: undefined,
  weight: undefined,
  leading: 'normal',
  tight: false,
  loose: false
};

const focusableElements = ['input', 'select', 'textarea', 'button', 'a'];

class Touchable extends PureComponent {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleKeyPress(e) {
    const {
      onTouch
    } = this.props;

    if (onTouch && (e.key && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') || e.keyCode && (e.keyCode === 13 || e.keyCode === 32))) {
      e.preventDefault();
      onTouch(e);
    }
  }

  render() {
    const _this$props = this.props,
          {
      is,
      children,
      tabIndex,
      disabled,
      onTouch
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["is", "children", "tabIndex", "disabled", "onTouch"]);

    const isSemantic = focusableElements.includes(is);
    return /*#__PURE__*/React.createElement(Base$1, _extends({
      is: is,
      select: "none",
      cursor: "pointer",
      pointerEvents: disabled ? 'none' : undefined,
      focusable: true,
      role: !isSemantic ? 'button' : undefined,
      tabIndex: tabIndex || (!isSemantic && !disabled ? 0 : undefined),
      opacity: disabled ? 50 : undefined,
      disabled: disabled,
      "aria-disabled": disabled || undefined,
      onClick: onTouch,
      onKeyPress: !isSemantic && !disabled ? this.handleKeyPress : undefined
    }, rest), children);
  }

}

Touchable.displayName = "Touchable";
Touchable.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  disabled: PropTypes.bool,
  tabIndex: PropTypes.number,
  onTouch: PropTypes.func
};
Touchable.defaultProps = {
  is: 'button',
  children: undefined,
  disabled: false,
  tabIndex: undefined,
  onTouch: undefined
};

const Button = (_ref) => {
  let {
    theme,
    is,
    children,
    type,
    buttonStyle,
    disabled,
    large,
    small,
    fullWidth,
    bg,
    text,
    border,
    brand
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children", "color", "type", "buttonStyle", "disabled", "large", "small", "fullWidth", "bg", "text", "border", "brand"]);

  const props = {
    border: [true, 'transparent'],
    leading: 'tight',
    p: {
      x: theme.spacing.md,
      y: theme.spacing.sm
    },
    rounded: theme.radius,
    noUnderline: true
  };

  if (large) {
    props.p = {
      x: theme.spacing.lg,
      y: theme.spacing.md
    };
  } else if (small) {
    props.p = {
      x: theme.spacing.sm,
      y: theme.spacing.sm / 2
    };
  }

  switch (buttonStyle) {
    case 'fill':
      props.bg = brand ? theme.brandColors[brand] : bg;
      props.text = brand ? theme.textColors.on[brand] : text;
      props['bg-hocus'] = getColorShade(brand ? theme.brandColors[brand] : bg, theme.highlightOffset);
      break;

    case 'outline':
      // eslint-disable-next-line react/prop-types
      props.border.push(brand ? theme.brandColors[brand] : border);
      props.text = brand ? theme.brandColors[brand] : border;
      props['bg-hocus'] = brand ? theme.brandColors[brand] : border;
      props['text-hocus'] = brand ? theme.textColors.on[brand] : text;
      break;

    case 'text':
      props.text = brand ? theme.brandColors[brand] : text;
      props['bg-hocus'] = `${getColorShade(brand ? theme.brandColors[brand] : text, 'lightest')}`;
      break;

    case 'link':
      props.rounded = undefined;
      props.noUnderline = undefined;
      props.leading = 'normal';
      props.p = 0;
      props.underline = true;
      props.text = brand ? theme.brandColors[brand] : text;
      props['text-hocus'] = getColorShade(brand ? theme.brandColors[brand] : text, theme.highlightOffset);
      break;

    default:
      break;
  }

  if (is === 'button') {
    props.type = type;
  } else {
    props.role = 'button';
  }

  if (disabled) {
    props.opacity = 50;
    props.disabled = true;
  }

  if (fullWidth) {
    props.w = 'full';
  }

  return /*#__PURE__*/React.createElement(Touchable, _extends({
    is: is,
    inlineBlock: true
  }, props, rest), children);
};

Button.displayName = "Button";
Button.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  color: PropTypes.string,
  type: PropTypes.string,
  buttonStyle: PropTypes.oneOf(['fill', 'outline', 'text', 'link']),
  disabled: PropTypes.bool,
  large: PropTypes.bool,
  small: PropTypes.bool,
  fullWidth: PropTypes.bool,
  brand: PropTypes.string,
  bg: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  border: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};
Button.defaultProps = {
  is: 'button',
  children: undefined,
  color: 'primary',
  type: 'button',
  buttonStyle: 'fill',
  disabled: false,
  large: false,
  small: false,
  fullWidth: false,
  brand: undefined,
  bg: undefined,
  text: undefined,
  border: undefined
};
var Button$1 = withTheme(Button);

/**
 * @see See [Button](#button-2) for API. Sets `buttonStyle` prop to `fill`.
 */

const FillButton = props => /*#__PURE__*/React.createElement(Button$1, _extends({}, props, {
  buttonStyle: "fill"
}));

FillButton.displayName = "FillButton";

/**
 * @see See [Button](#button-2) for API. Sets `buttonStyle` prop to `outline`.
 */

const OutlineButton = props => /*#__PURE__*/React.createElement(Button$1, _extends({}, props, {
  buttonStyle: "outline"
}));

OutlineButton.displayName = "OutlineButton";

/**
 * @see See [Button](#button-2) for API. Sets `buttonStyle` prop to `text`.
 */

const TextButton = props => /*#__PURE__*/React.createElement(Button$1, _extends({}, props, {
  buttonStyle: "text"
}));

TextButton.displayName = "TextButton";

/**
 * @see See [Button](#button-2) for API. Sets `buttonStyle` prop to `link`.
 */

const LinkButton = props => /*#__PURE__*/React.createElement(Button$1, _extends({}, props, {
  buttonStyle: "link"
}));

LinkButton.displayName = "LinkButton";

const Card = (_ref) => {
  let {
    is,
    children,
    theme,
    surface
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children", "theme", "surface"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    overflow: "hidden",
    rounded: theme.radius,
    bg: theme.surfaceColors[surface] || theme.brandColors[surface],
    text: surface !== 'default' ? theme.textColors.on[surface] : undefined
  }, rest), children);
};

Card.displayName = "Card";
Card.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  theme: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  surface: PropTypes.string
};
Card.defaultProps = {
  is: 'section',
  children: undefined,
  surface: 'default'
};
var Card$1 = withTheme(Card);

const CardBody = (_ref) => {
  let {
    theme,
    is,
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    p: theme.spacing.md
  }, rest), children);
};

CardBody.displayName = "CardBody";
CardBody.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node
};
CardBody.defaultProps = {
  is: 'div',
  children: undefined
};
var CardBody$1 = withTheme(CardBody);

const CardFooter = (_ref) => {
  let {
    is,
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children"]);

  return /*#__PURE__*/React.createElement(Flex, _extends({
    is: is,
    reverse: true,
    items: "end"
  }, rest), React.Children.map(children, child => React.cloneElement(child, {
    rounded: 'none'
  })));
};

CardFooter.displayName = "CardFooter";
CardFooter.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node
};
CardFooter.defaultProps = {
  is: 'div',
  children: undefined
};

const Container = (_ref) => {
  let {
    theme,
    is,
    children,
    leftAlign,
    padding
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children", "leftAlign", "padding"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    m: !leftAlign ? {
      x: 'auto'
    } : undefined,
    p: padding ? {
      x: theme.spacing.md
    } : undefined,
    container: true
  }, rest), children);
};

Container.displayName = "Container";
Container.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  leftAlign: PropTypes.bool,
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
Container.defaultProps = {
  is: 'div',
  children: undefined,
  leftAlign: false,
  padding: false
};
var Container$1 = withTheme(Container);

const Title = (_ref) => {
  let {
    theme,
    children,
    is,
    size,
    subtitle,
    flush,
    level
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "children", "is", "size", "subtitle", "flush", "level"]);

  const hLevel = level || Math.max(7 - size, 1);
  const element = is || `h${hLevel}`;
  let ariaProps = {};

  if (!subtitle && element !== 'string' && !/h[1-6]/i.test(element)) {
    ariaProps = {
      role: 'heading',
      'aria-level': hLevel
    };
  }

  return /*#__PURE__*/React.createElement(Text, _extends({
    is: element
  }, ariaProps, {
    leading: "tight",
    font: [theme.text.family[subtitle ? 'subtitle' : 'title'], subtitle ? 'medium' : 'bold'],
    text: [theme.text.size.title[size - 1], subtitle ? theme.textColors.body : theme.textColors.emphasis],
    m: !flush ? {
      b: theme.spacing.md
    } : undefined
  }, rest), children);
};

Title.displayName = "Title";
Title.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  size: PropTypes.number,
  subtitle: PropTypes.bool,
  flush: PropTypes.bool,
  level: PropTypes.number
};
Title.defaultProps = {
  children: undefined,
  is: undefined,
  size: 4,
  subtitle: false,
  flush: false,
  level: undefined
};
var Title$1 = withTheme(Title);

/**
 * @see See [Title](#title) for prop type definitions. Sets `subtitle` to `true`.
 */

const Subtitle = props => /*#__PURE__*/React.createElement(Title$1, _extends({}, props, {
  subtitle: true
}));

Subtitle.displayName = "Subtitle";

const Paragraph = (_ref) => {
  let {
    theme,
    children,
    is,
    size,
    lead,
    text
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "children", "is", "size", "lead", "brand", "paragraph", "text"]);

  return /*#__PURE__*/React.createElement(Text, _extends({
    is: is,
    text: [(size || lead) && theme.text.size.body[(lead ? theme.text.size.body.length : size) - 1], ...getAsArray(text)],
    m: {
      b: theme.spacing.md
    }
  }, rest), children);
};

Paragraph.displayName = "Paragraph";
Paragraph.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  size: PropTypes.number,
  lead: PropTypes.bool,
  brand: PropTypes.bool,
  paragraph: PropTypes.bool,
  text: propTypes.text
};
Paragraph.defaultProps = {
  children: undefined,
  is: 'p',
  size: undefined,
  paragraph: false,
  lead: false,
  brand: false,
  text: undefined
};
var Paragraph$1 = withTheme(Paragraph);

const BrandText = (_ref) => {
  let {
    theme,
    textOnly,
    type
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "textOnly", "type"]);

  const alertProps = !textOnly ? {
    bg: getColorShade(theme.brandColors[type], 'lightest'),
    border: [`l-${theme.accentSize}`, theme.brandColors[type]],
    p: {
      x: theme.spacing.md,
      y: theme.spacing.sm
    },
    text: theme.textColors.body,
    rounded: 'r'
  } : {};
  return /*#__PURE__*/React.createElement(Paragraph$1, _extends({}, rest, {
    brand: true,
    rounded: theme.radius,
    text: getColorShade(theme.brandColors[type], 1),
    m: {
      b: theme.spacing.sm
    }
  }, alertProps));
};

BrandText.displayName = "BrandText";
BrandText.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  textOnly: PropTypes.bool,
  type: PropTypes.string.isRequired
};
BrandText.defaultProps = {
  is: 'p',
  textOnly: false
};
var BrandText$1 = withTheme(BrandText);

/**
 * @see See [BrandText](#brandtext) for API. Sets `type` prop to `danger`.
 */

const DangerText = props => /*#__PURE__*/React.createElement(BrandText$1, _extends({}, props, {
  type: "danger"
}));

DangerText.displayName = "DangerText";

/**
 * @see See [BrandText](#brandtext) for API. Sets `type` prop to `info`.
 */

const InfoText = props => /*#__PURE__*/React.createElement(BrandText$1, _extends({}, props, {
  type: "info"
}));

InfoText.displayName = "InfoText";

/**
 * @see See [BrandText](#brandtext) for API. Sets `type` prop to `warning`.
 */

const WarningText = props => /*#__PURE__*/React.createElement(BrandText$1, _extends({}, props, {
  type: "warning"
}));

WarningText.displayName = "WarningText";

const ContentTitle = (_ref) => {
  let {
    content: {
      id
    },
    visuallyHidden
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["content", "visuallyHidden"]);

  return /*#__PURE__*/React.createElement(Title$1, _extends({
    id: id,
    visuallyHidden: visuallyHidden
  }, rest));
};

ContentTitle.displayName = "ContentTitle";
ContentTitle.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.string
  }),
  visuallyHidden: PropTypes.bool
};
ContentTitle.defaultProps = {
  content: {},
  visuallyHidden: false
};

class ContentBlock extends PureComponent {
  constructor(props) {
    super(props);
    this.id = getUniqueID('content');
  }

  render() {
    const _this$props = this.props,
          {
      theme,
      is,
      children
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["theme", "is", "children"]);

    return /*#__PURE__*/React.createElement(Box, _extends({
      is: is,
      p: theme.spacing.md,
      "aria-labelledby": this.id
    }, rest), React.Children.map(children, (child, index) => {
      if (child.type === ContentTitle) {
        return React.cloneElement(child, {
          content: {
            id: this.id
          }
        });
      }

      if (index === React.Children.count(children) - 1) {
        return React.cloneElement(child, {
          m: {
            b: 0
          }
        });
      }

      return child;
    }));
  }

}

ContentBlock.displayName = "ContentBlock";
ContentBlock.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node
};
ContentBlock.defaultProps = {
  is: 'section',
  children: undefined
};
var ContentBlock$1 = withTheme(ContentBlock);

const Article = (_ref) => {
  let {
    is
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is"]);

  return /*#__PURE__*/React.createElement(ContentBlock$1, _extends({
    is: is
  }, rest));
};

Article.displayName = "Article";
Article.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
};
Article.defaultProps = {
  is: 'article'
};

const Aside = (_ref) => {
  let {
    is
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is"]);

  return /*#__PURE__*/React.createElement(ContentBlock$1, _extends({
    is: is
  }, rest));
};

Aside.displayName = "Aside";
Aside.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
};
Aside.defaultProps = {
  is: 'aside'
};

const Section = (_ref) => {
  let {
    is
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is"]);

  return /*#__PURE__*/React.createElement(ContentBlock$1, _extends({
    is: is
  }, rest));
};

Section.displayName = "Section";
Section.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
};
Section.defaultProps = {
  is: 'section'
};

const Footer = (_ref) => {
  let {
    theme,
    is,
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    role: "contentinfo",
    p: {
      t: theme.spacing.lg,
      b: theme.spacing.xl
    },
    bg: theme.brandColors.secondary,
    text: theme.textColors.on.secondary
  }, rest), /*#__PURE__*/React.createElement(Container$1, {
    padding: true
  }, children));
};

Footer.displayName = "Footer";
Footer.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node
};
Footer.defaultProps = {
  is: 'footer',
  children: undefined
};
var Footer$1 = withTheme(Footer);

/**
 * @see Renders as [DangerText](#dangertext) component by default
 */

const ErrorText = (_ref) => {
  let {
    field: {
      errorId
    },
    is
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["field", "is"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    id: errorId,
    "aria-live": "assertive"
  }, rest));
};

ErrorText.displayName = "ErrorText";
ErrorText.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  field: PropTypes.shape({
    errorId: PropTypes.string
  }),
  size: PropTypes.number
};
ErrorText.defaultProps = {
  is: DangerText,
  field: {},
  size: 1
};

class Field extends PureComponent {
  constructor(props) {
    const {
      id
    } = props;
    super(props);
    this.id = id || getUniqueID('field');
  }

  render() {
    const _this$props = this.props,
          {
      theme,
      is,
      children,
      hasHelp,
      hasError,
      disabled,
      optionList
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["theme", "is", "children", "className", "hasHelp", "hasError", "disabled", "optionList"]);

    const fieldProps = {
      inputId: `${this.id}-input`,
      helpId: hasHelp ? `${this.id}-help` : undefined,
      errorId: hasError ? `${this.id}-error` : undefined,
      labelId: optionList ? `${this.id}-label` : undefined,
      invalid: hasError,
      disabled
    };
    return /*#__PURE__*/React.createElement(Box, _extends({
      is: is,
      id: this.id,
      m: {
        b: theme.spacing.md
      },
      maxW: "sm"
    }, filterProps(rest, ['id'])), React.Children.map(children, child => React.cloneElement(child, {
      field: fieldProps
    })));
  }

}

Field.displayName = "Field";
Field.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  className: PropTypes.string,
  hasHelp: PropTypes.bool,
  hasError: PropTypes.bool,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  optionList: PropTypes.bool
};
Field.defaultProps = {
  is: 'div',
  children: undefined,
  className: undefined,
  hasHelp: false,
  hasError: false,
  disabled: false,
  id: undefined,
  optionList: false
};
var Field$1 = withTheme(Field);

/**
 * @see Renders as [InfoText](#infotext) component by default
 */

const HelpText = (_ref) => {
  let {
    is,
    field: {
      helpId
    }
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "field"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    id: helpId
  }, rest));
};

HelpText.displayName = "HelpText";
HelpText.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  field: PropTypes.shape({
    helpId: PropTypes.string
  }),
  size: PropTypes.number
};
HelpText.defaultProps = {
  is: InfoText,
  field: {},
  size: 1
};

const Label = (_ref) => {
  let {
    theme,
    is,
    id,
    field: {
      labelId,
      inputId,
      disabled
    },
    children,
    htmlFor,
    optionList
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "id", "field", "children", "htmlFor", "optionList"]);

  return /*#__PURE__*/React.createElement(Text, _extends({
    is: is,
    id: labelId || id,
    inlineBlock: true,
    htmlFor: !optionList ? inputId || htmlFor : undefined,
    m: {
      b: theme.spacing.sm
    },
    opacity: disabled ? 50 : undefined,
    weight: "bold"
  }, rest), children);
};

Label.displayName = "Label";
Label.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  id: PropTypes.string,
  field: PropTypes.shape({
    inputId: PropTypes.string,
    disabled: PropTypes.bool
  }),
  children: PropTypes.node,
  htmlFor: PropTypes.string,
  optionList: PropTypes.bool
};
Label.defaultProps = {
  is: 'label',
  id: undefined,
  field: {
    disabled: false
  },
  children: undefined,
  htmlFor: undefined,
  optionList: false
};
var Label$1 = withTheme(Label);

const ExpandMore = props => /*#__PURE__*/React.createElement("svg", _extends({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M0 0h24v24H0z",
  fill: "none"
}));

ExpandMore.displayName = "ExpandMore";

const Select = (_ref) => {
  let {
    theme,
    is,
    field,
    id,
    name,
    type,
    disabled,
    readOnly,
    invalid,
    placeholder,
    options,
    icon
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "field", "children", "id", "name", "type", "disabled", "readOnly", "invalid", "placeholder", "options", "icon"]);

  const describedBy = [field.errorId, field.helpId].filter(by => by);
  const isInvalid = field.invalid || invalid;
  return /*#__PURE__*/React.createElement(Box, {
    relative: true,
    m: {
      b: theme.spacing.sm
    }
  }, /*#__PURE__*/React.createElement(Touchable, _extends({
    is: is,
    appearance: "none",
    bg: "white",
    rounded: theme.radius,
    text: theme.textColors.body,
    p: {
      l: theme.spacing.md,
      r: theme.spacing.lg,
      y: theme.spacing.sm
    },
    border: !isInvalid ? true : [true, theme.brandColors.danger],
    w: "full",
    leading: "tight",
    id: field.inputId || id || name,
    name: name,
    type: type,
    disabled: field.disabled || disabled,
    readOnly: readOnly,
    "aria-invalid": isInvalid || undefined,
    "aria-describedby": describedBy.length ? describedBy.join(' ') : undefined
  }, rest), !!placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(option => /*#__PURE__*/React.createElement("option", {
    key: `${name}-${option.value}`,
    value: option.value
  }, option.label))), /*#__PURE__*/React.createElement(Box, {
    absolute: true,
    pin: ['y', 'r'],
    flex: true,
    items: "center",
    p: {
      x: theme.spacing.sm
    },
    pointerEvents: "none"
  }, /*#__PURE__*/React.createElement(Box, {
    is: icon,
    h: 6,
    w: 6
  })));
};

Select.displayName = "Select";
Select.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  field: PropTypes.shape({
    inputId: PropTypes.string,
    invalid: PropTypes.bool,
    disabled: PropTypes.bool
  }),
  children: PropTypes.node,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  invalid: PropTypes.bool,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  }))
};
Select.defaultProps = {
  is: 'select',
  field: {},
  children: undefined,
  id: undefined,
  type: 'text',
  disabled: false,
  readOnly: false,
  invalid: false,
  placeholder: 'Please select',
  icon: ExpandMore,
  options: []
};
var Select$1 = withTheme(Select);

const TextInput = (_ref) => {
  let {
    theme,
    is,
    field,
    id,
    name,
    type,
    disabled,
    readOnly,
    invalid
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "field", "children", "id", "name", "type", "disabled", "readOnly", "invalid"]);

  const describedBy = [field.errorId, field.helpId].filter(by => by);
  const isInvalid = field.invalid || invalid;
  return /*#__PURE__*/React.createElement(Touchable, _extends({
    is: is,
    appearance: "none",
    bg: "white",
    rounded: theme.radius,
    text: theme.textColors.body,
    p: {
      x: theme.spacing.md,
      y: theme.spacing.sm
    },
    m: {
      b: theme.spacing.sm
    },
    border: !isInvalid ? true : [true, theme.brandColors.danger],
    w: "full",
    leading: "tight",
    id: field.inputId || id || name,
    name: name,
    type: type,
    disabled: field.disabled || disabled,
    readOnly: readOnly,
    "aria-invalid": isInvalid || undefined,
    "aria-describedby": describedBy.length ? describedBy.join(' ') : undefined
  }, rest));
};

TextInput.displayName = "TextInput";
TextInput.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  field: PropTypes.shape({
    inputId: PropTypes.string,
    invalid: PropTypes.bool,
    disabled: PropTypes.bool
  }),
  children: PropTypes.node,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  invalid: PropTypes.bool
};
TextInput.defaultProps = {
  is: 'input',
  field: {},
  children: undefined,
  id: undefined,
  type: 'text',
  disabled: false,
  readOnly: false,
  invalid: false
};
var TextInput$1 = withTheme(TextInput);

class OptionInput extends PureComponent {
  constructor(props) {
    super(props);
    const {
      defaultChecked,
      checked
    } = props;
    this.state = {
      checked: defaultChecked || !!checked
    };
    this.inputRef = null;
    this.handleChange = this.handleChange.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentDidUpdate(prevProps) {
    this.handleUpdate(prevProps);
  }

  handleChange(e) {
    const {
      checkbox,
      onChange,
      checked
    } = this.props;

    if (checked === undefined) {
      this.setState(({
        checked: checkedState
      }) => ({
        checked: checkbox ? !checkedState : true
      }));
    }

    if (onChange) onChange(_extends(_extends({}, e), {}, {
      target: this.inputRef.current
    }));
    e.preventDefault();
  }

  handleUpdate() {
    const {
      checked
    } = this.props;
    const {
      checked: checkedState
    } = this.state;

    if (checked !== undefined && checked !== checkedState) {
      this.setState({
        checked
      });
    }
  }

  render() {
    const _this$props = this.props,
          {
      theme,
      name,
      value,
      label,
      hideLabel,
      checkbox,
      id
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["theme", "name", "value", "label", "hideLabel", "checkbox", "id"]);

    const {
      checked
    } = this.state;
    this.inputRef = React.createRef();
    return /*#__PURE__*/React.createElement(Touchable, _extends({
      is: Label$1,
      flex: true,
      items: "center",
      onTouch: this.handleChange
    }, rest), /*#__PURE__*/React.createElement(Box, {
      is: "input",
      id: id,
      visuallyHidden: true,
      name: name,
      type: checkbox ? 'checkbox' : 'radio',
      value: value,
      checked: checked,
      tabIndex: "-1",
      innerRef: this.inputRef,
      onChange: () => {}
    }), /*#__PURE__*/React.createElement(Flex, {
      items: "center",
      justify: "center",
      inlineBlock: true,
      rounded: checkbox ? theme.radius : 'full',
      h: 4,
      w: 4,
      border: [true, checked ? theme.brandColors.primary : false].filter(prop => !!prop),
      bg: checkbox && checked ? theme.brandColors.primary : undefined,
      m: {
        r: theme.spacing.sm
      }
    }, checked && (checkbox ? /*#__PURE__*/React.createElement(Box, {
      is: "svg",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      h: 3,
      w: 3,
      text: "white",
      fill: "current"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M0 0h24v24H0z",
      fill: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
    })) : /*#__PURE__*/React.createElement(Box, {
      inlineBlock: true,
      rounded: "full",
      h: 2,
      w: 2,
      bg: theme.brandColors.primary
    }))), /*#__PURE__*/React.createElement(Box, {
      inlineBlock: true,
      visuallyHidden: hideLabel,
      leading: "tight",
      font: "normal"
    }, label));
  }

}

OptionInput.displayName = "OptionInput";
OptionInput.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hideLabel: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  checkbox: PropTypes.bool,
  id: PropTypes.string
};
OptionInput.defaultProps = {
  hideLabel: false,
  defaultChecked: undefined,
  checked: undefined,
  onChange: undefined,
  checkbox: false,
  id: undefined
};
var OptionInput$1 = withTheme(OptionInput);

const Radio = props => /*#__PURE__*/React.createElement(OptionInput$1, _extends({}, props, {
  checkbox: false
}));

Radio.displayName = "Radio";

const Checkbox = props => /*#__PURE__*/React.createElement(OptionInput$1, _extends({}, props, {
  checkbox: true
}));

Checkbox.displayName = "Checkbox";

const List = (_ref) => {
  let {
    theme,
    is,
    children,
    padding,
    reset,
    inline,
    justified,
    fullWidth,
    ordered,
    listItemIs
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children", "padding", "reset", "inline", "justified", "fullWidth", "ordered", "listItemIs"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: ordered ? 'ol' : is,
    m: {
      b: theme.spacing.md
    },
    flex: justified || fullWidth || (inline ? [true, 'wrap'].concat(rest.flex || []) : rest.flex),
    justify: justified ? 'between' : undefined,
    listReset: reset || inline || justified || fullWidth
  }, rest), React.Children.map(children, child => child && /*#__PURE__*/React.createElement(Box, {
    is: listItemIs,
    m: {
      b: padding && !justified && !fullWidth && theme.spacing.sm,
      r: inline && theme.spacing.sm
    },
    flex: fullWidth ? 'grow' : undefined
  }, child)));
};

List.displayName = "List";
List.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  padding: PropTypes.bool,
  reset: PropTypes.bool,
  inline: PropTypes.bool,
  justified: PropTypes.bool,
  fullWidth: PropTypes.bool,
  ordered: PropTypes.bool,
  listItemIs: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
};
List.defaultProps = {
  is: 'ul',
  children: undefined,
  padding: false,
  reset: false,
  inline: false,
  justified: false,
  fullWidth: false,
  ordered: false,
  listItemIs: 'li'
};
var List$1 = withTheme(List);

class OptionList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checked: []
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const {
      checkbox
    } = this.props;
    const {
      checked
    } = this.state;
    const {
      value
    } = e.target;

    if (checkbox) {
      return this.setState({
        checked: checked.includes(value) ? checked.filter(checkedVal => checkedVal !== value) : [...checked, value]
      });
    }

    return this.setState({
      checked: [e.target.value]
    });
  }

  render() {
    const _this$props = this.props,
          {
      children,
      name,
      checkbox,
      field,
      invalid
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["theme", "children", "name", "checkbox", "field", "invalid"]);

    const {
      checked
    } = this.state;
    const describedBy = [field.labelId, field.errorId, field.helpId].filter(by => by);
    const isInvalid = field.invalid || invalid;
    return /*#__PURE__*/React.createElement(List$1, _extends({
      reset: true,
      m: {
        b: 0
      }
    }, rest), React.Children.map(children, child => {
      const value = child.props && child.props.value;
      return React.cloneElement(child, {
        id: `${field.inputId}-${value}`,
        name: checkbox ? `${name}[]` : name,
        checked: checked.includes(value),
        onChange: this.handleChange,
        'aria-invalid': isInvalid || undefined,
        'aria-describedby': describedBy.length ? describedBy.join(' ') : undefined
      });
    }));
  }

}

OptionList.displayName = "OptionList";
OptionList.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  name: PropTypes.string.isRequired,
  field: PropTypes.shape({
    inputId: PropTypes.string,
    invalid: PropTypes.bool,
    disabled: PropTypes.bool
  }),
  checkbox: PropTypes.bool,
  invalid: PropTypes.bool
};
OptionList.defaultProps = {
  children: undefined,
  checkbox: false,
  field: {},
  invalid: false
};
var OptionList$1 = withTheme(OptionList);

const getWidthProps = width => {
  if (typeof width === 'object') {
    return Object.keys(width).reduce((props, breakpoint) => {
      const breakpointSuffix = breakpoint === 'def' ? '' : `-${breakpoint}`;

      if (width === 'auto') {
        return _extends(_extends({}, props), {}, {
          [`flex${breakpointSuffix}`]: 1
        });
      }

      return _extends(_extends({}, props), {}, {
        [`w${breakpointSuffix}`]: width[breakpoint]
      });
    }, {});
  }

  return width === 'auto' ? {
    flex: 1
  } : {
    w: width
  };
};

const Col = (_ref) => {
  let {
    is,
    children,
    w
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children", "w"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is
  }, getWidthProps(w), rest), children);
};

Col.displayName = "Col";
Col.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  w: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};
Col.defaultProps = {
  is: 'li',
  children: undefined,
  w: 'full'
};

const Row = (_ref) => {
  let {
    is,
    children,
    nowrap,
    gutter,
    theme
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "children", "nowrap", "gutter", "theme"]);

  const gutterSpacing = gutter && (gutter === true ? theme.spacing.md : theme.spacing[gutter]);
  return /*#__PURE__*/React.createElement(Flex, _extends({
    is: is,
    wrap: !nowrap,
    nm: gutter ? {
      l: gutterSpacing,
      b: !nowrap ? gutterSpacing : undefined
    } : undefined,
    listReset: true
  }, rest), gutter ? React.Children.map(children, child => React.cloneElement(child, {
    p: {
      l: gutterSpacing
    },
    m: {
      b: gutterSpacing
    }
  })) : children);
};

Row.displayName = "Row";
Row.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  nowrap: PropTypes.bool,
  gutter: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};
Row.defaultProps = {
  is: 'ul',
  children: undefined,
  nowrap: false,
  gutter: false
};
var Row$1 = withTheme(Row);

class Header extends PureComponent {
  constructor(props) {
    const {
      id,
      screen
    } = props;
    super(props);
    this.state = {
      open: false,
      collapsable: !!screen
    };
    this.mql = null;
    this.id = id || getUniqueID('header');
    this.handleMatch = this.handleMatch.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentDidMount() {
    const {
      theme,
      screen
    } = this.props;

    if (screen && window.matchMedia) {
      this.mql = window.matchMedia(`(min-width: ${theme.breakpoints[screen]})`);
      this.mql.addListener(this.handleMatch);

      if (this.mql.matches) {
        this.handleMatch(this.mql);
      }
    }
  }

  componentWillUnmount() {
    if (this.mql) this.mql.removeListener(this.handleMatch);
  }

  handleToggle(forceState) {
    const {
      open
    } = this.state;
    this.setState({
      open: forceState || !open
    });
  }

  handleMatch(mql) {
    this.setState({
      collapsable: !mql.matches
    });
  }

  render() {
    const {
      open,
      collapsable
    } = this.state;

    const _this$props = this.props,
          {
      theme,
      is,
      children,
      bg,
      text,
      screen
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["theme", "is", "children", "bg", "text", "screen"]);

    const headerProps = {
      id: this.id,
      style: {
        bg: bg || theme.brandColors.primary,
        text: text || theme.textColors.on.primary
      },
      open,
      collapsable,
      onToggle: this.handleToggle,
      screen
    };
    return /*#__PURE__*/React.createElement(Box, _extends({
      is: is,
      id: headerProps.id,
      bg: headerProps.style.bg,
      text: headerProps.style.text,
      p: {
        y: theme.spacing.md
      },
      role: "banner"
    }, filterProps(rest, ['id'])), /*#__PURE__*/React.createElement(Container$1, {
      is: Flex,
      wrap: true,
      items: "center",
      justify: "between",
      padding: true
    }, React.Children.map(children, child => React.cloneElement(child, {
      header: headerProps
    }))));
  }

}

Header.displayName = "Header";
Header.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  bg: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  id: PropTypes.string,
  screen: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};
Header.defaultProps = {
  is: 'header',
  children: undefined,
  bg: undefined,
  text: undefined,
  id: undefined,
  screen: 'lg'
};
var Header$1 = withTheme(Header);

const NavBrand = (_ref) => {
  let {
    theme,
    header: {
      style,
      screen
    },
    is,
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "header", "is", "children"]);

  const responsive = screen ? {
    [`m-${screen}`]: {
      r: theme.spacing.lg
    }
  } : {};
  const aria = !(typeof is === 'string' && is.startsWith('h')) ? {
    role: 'heading',
    'aria-level': 1
  } : {};
  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    inlineBlock: true,
    noUnderline: true,
    flex: [true, 'no-shrink'],
    items: "center",
    h: 12,
    text: style.text || theme.textColors.on.primary
  }, responsive, aria, rest), children);
};

NavBrand.displayName = "NavBrand";
NavBrand.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  header: PropTypes.shape({
    style: PropTypes.object,
    screen: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  })
};
NavBrand.defaultProps = {
  is: 'div',
  children: undefined,
  header: {
    style: {},
    screen: 'lg'
  }
};
var NavBrand$1 = withTheme(NavBrand);

const NavItem = (_ref) => {
  let {
    theme,
    is,
    children,
    header: {
      style,
      screen
    },
    active
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "is", "children", "header", "active"]);

  const textColor = style.text || theme.textColors.on.primary;
  const bgColor = style.bg || theme.brandColors.primary;
  const responsive = screen ? {
    [`m-${screen}`]: {
      t: 0,
      r: theme.spacing.sm
    }
  } : {};
  return /*#__PURE__*/React.createElement(Touchable, _extends({
    is: is,
    focusable: true,
    text: !active ? style.text : style.bg,
    bg: active ? textColor : undefined,
    "bg-hocus": textColor,
    "text-hocus": bgColor,
    p: {
      x: theme.spacing.md,
      y: theme.spacing.sm
    },
    m: {
      t: theme.spacing.sm
    },
    rounded: theme.radius,
    noUnderline: true,
    block: true,
    "aria-current": active ? 'page' : undefined
  }, responsive, rest), children);
};

NavItem.displayName = "NavItem";
NavItem.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  header: PropTypes.shape({
    style: PropTypes.object,
    screen: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  }),
  active: PropTypes.bool
};
NavItem.defaultProps = {
  is: 'a',
  children: undefined,
  header: {
    style: {},
    screen: 'lg'
  },
  active: false
};
var NavItem$1 = withTheme(NavItem);

const NavItemWrapper = props => /*#__PURE__*/React.createElement("li", _extends({
  role: "none"
}, props));

NavItemWrapper.displayName = "NavItemWrapper";

const NavMenu = (_ref) => {
  let {
    transition,
    is,
    children,
    header,
    list
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "transition", "is", "children", "header", "list"]);

  const transitionStyles = {
    entering: {
      maxHeight: '0',
      position: 'absolute'
    },
    entered: {
      maxHeight: '100vh'
    }
  };
  const headingId = `${header.id}-menu`;
  const responsive = {
    nav: header.screen ? {
      [`w-${header.screen}`]: 'auto',
      [`flex-${header.screen}`]: true
    } : {},
    menu: header.screen ? {
      [`flex-${header.screen}`]: true,
      [`m-${header.screen}`]: {
        b: 0
      }
    } : {}
  };
  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    overflow: "hidden",
    w: "full",
    flex: "grow",
    items: "center",
    h: !header.collapsable ? 12 : undefined,
    style: header.collapsable ? _extends({
      transition: 'max-height 500ms',
      maxHeight: '0'
    }, transitionStyles[transition]) : undefined,
    id: `${header.id}-nav`,
    "aria-labelledby": headingId,
    "aria-expanded": header.collapsable ? header.open : undefined,
    role: "navigation"
  }, responsive.nav, rest), /*#__PURE__*/React.createElement(Title$1, {
    level: 2,
    id: headingId,
    visuallyHidden: true
  }, "Site menu"), /*#__PURE__*/React.createElement(List$1, _extends({
    reset: true,
    flex: "grow",
    role: "menu",
    listItemIs: NavItemWrapper
  }, responsive.menu, list), React.Children.map(children, child => child.type === NavItem$1 && React.cloneElement(child, {
    header,
    role: 'menuitem'
  }))), React.Children.map(children, child => child.type !== NavItem$1 && child));
};

NavMenu.displayName = "NavMenu";
NavMenu.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  transition: PropTypes.string,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  header: PropTypes.shape({
    open: PropTypes.bool,
    collapsable: PropTypes.bool,
    screen: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
  }),
  list: PropTypes.shape({})
};
NavMenu.defaultProps = {
  is: 'nav',
  children: undefined,
  header: {
    open: false,
    collapsable: false,
    screen: 'lg'
  },
  transition: 'entering',
  list: {}
};
var NavMenu$1 = withTheme(withTheme$1(NavMenu, {
  inState: 'header.open'
}));

const Bar = () => /*#__PURE__*/React.createElement(Box, {
  inlineBlock: true,
  border: "b",
  style: {
    borderColor: 'currentColor'
  }
});

Bar.displayName = "Bar";

const NavToggle = (_ref) => {
  let {
    theme,
    children,
    onClick,
    header: {
      onToggle,
      style,
      id,
      screen
    }
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme", "children", "onClick", "header"]);

  const handleClick = e => {
    onToggle();
    if (onClick) onClick(e);
  };

  const responsive = screen ? {
    [`hidden-${screen}`]: true
  } : {};
  return /*#__PURE__*/React.createElement(Button$1, _extends({
    w: 12,
    h: 12,
    p: 0,
    block: true,
    onClick: handleClick,
    "aria-label": "Open menu",
    "aria-haspopup": "true",
    "aria-controls": `${id}-nav`,
    text: style.text || theme.textColors.on.primary,
    "bg-hocus": style.text || theme.textColors.on.primary,
    "text-hocus": style.bg || theme.brandColors.primary
  }, responsive, rest), children || /*#__PURE__*/React.createElement(Box, {
    flex: [true, 'col'],
    items: "stretch",
    justify: "around",
    h: "full",
    p: 3
  }, /*#__PURE__*/React.createElement(Bar, null), /*#__PURE__*/React.createElement(Bar, null), /*#__PURE__*/React.createElement(Bar, null)));
};

NavToggle.displayName = "NavToggle";
NavToggle.propTypes = {
  theme: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  header: PropTypes.shape({
    onToggle: PropTypes.func.isRequired,
    screen: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    style: PropTypes.object
  }),
  onClick: PropTypes.func
};
NavToggle.defaultProps = {
  children: undefined,
  onClick: undefined,
  header: {
    style: {},
    screen: 'lg'
  }
};
var NavToggle$1 = withTheme(NavToggle);

const Main = (_ref) => {
  let {
    children,
    is,
    id
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["children", "is", "id"]);

  return /*#__PURE__*/React.createElement(Box, _extends({
    is: is,
    id: id,
    role: "main"
  }, rest), children);
};

Main.displayName = "Main";
Main.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
};
Main.defaultProps = {
  children: undefined,
  id: 'main',
  is: 'main'
};

const SkipLink = (_ref) => {
  let {
    children,
    href
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["children", "href"]);

  return /*#__PURE__*/React.createElement(Box, {
    visuallyHiddenFocusable: true
  }, /*#__PURE__*/React.createElement(FillButton, _extends({
    is: "a",
    bg: "white",
    text: "black",
    absolute: true,
    rounded: "none",
    href: href
  }, rest), children || 'Skip to main content'));
};

SkipLink.displayName = "SkipLink";
SkipLink.propTypes = {
  children: PropTypes.node,
  href: PropTypes.string
};
SkipLink.defaultProps = {
  children: undefined,
  href: '#main'
};

const SiteWrap = (_ref) => {
  let {
    is,
    theme,
    children
  } = _ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["is", "theme", "children"]);

  let footer;
  React.Children.forEach(children, child => {
    const {
      type
    } = child;

    if (type && (type === Footer$1 || type.displayName === Footer.displayName)) {
      footer = child;
    }
  });
  return /*#__PURE__*/React.createElement(Flex, _extends({
    is: is,
    col: true,
    minH: "screen",
    leading: "normal",
    font: theme.text.family.body,
    text: [theme.text.size.body[1], theme.textColors.body]
  }, rest), /*#__PURE__*/React.createElement(Box, {
    flex: ['auto', 'no-shrink']
  }, React.Children.map(children, child => {
    if (child === footer) return false;
    return child;
  })), /*#__PURE__*/React.createElement(Box, {
    flex: ['auto', 'no-shrink', 'no-grow'],
    m: {
      t: theme.spacing.lg
    }
  }, footer));
};

SiteWrap.displayName = "SiteWrap";
SiteWrap.propTypes = {
  is: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object]),
  theme: PropTypes.shape({}).isRequired,
  children: PropTypes.node
};
SiteWrap.defaultProps = {
  is: 'div',
  children: undefined
};
var SiteWrap$1 = withTheme(SiteWrap);

export { Button$1 as Button, FillButton, OutlineButton, TextButton, LinkButton, Card$1 as Card, CardBody$1 as CardBody, CardFooter, Container$1 as Container, ContentTitle, ContentBlock$1 as ContentBlock, Article, Aside, Section, Footer$1 as Footer, ErrorText, Field$1 as Field, HelpText, Label$1 as Label, Select$1 as Select, TextInput$1 as TextInput, Radio, Checkbox, OptionList$1 as OptionList, Col, Row$1 as Row, Header$1 as Header, NavBrand$1 as NavBrand, NavItem$1 as NavItem, NavMenu$1 as NavMenu, NavToggle$1 as NavToggle, List$1 as List, Main, SkipLink, Base$1 as Base, Box, Flex, Image, Text, Touchable, SiteWrap$1 as SiteWrap, Subtitle, Paragraph$1 as Paragraph, Title$1 as Title, BrandText$1 as BrandText, DangerText, InfoText, WarningText, getColorShade, getTailwindClassNames, tailwindProps, propTypes, propVariants, tailwindPropToClassName, withTailwind, defaultTheme, TailwindTheme, TailwindThemeProvider, withTheme, useThemeValue, getAsArray, filterProps, getUniqueID, withTheme$1 as withTransition };
