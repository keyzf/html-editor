import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import './element.scss';
import utils from '../../../common/utils';
import { attributeUpdate, elementSelect, elementsUpdate } from '../actions';

const canMoveList = ['absolute', 'fixed', 'relative'];

class Element extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            isDown: false,

            // 起始拖拽位置
            startX: 0,
            startY: 0,
            // 移动中位置
            movingX: 0,
            movingY: 0,

            width: '',
            height: '',
            top: '',
            left: '',
        };
    }

    componentDidMount() {
        new Swiper('.swiper-container', {
            loop: true, // 循环模式选项

            // 如果需要分页器
            pagination: {
                el: '.swiper-pagination',
            },
        });
    }

    // 选择节点
    selectNode(id, e) {
        e.stopPropagation();
        const { activeId, elements } = this.props.editorInfo;
        this.props.dispatch(elementSelect(id, activeId, elements));

        // 展示元素位置
        const treeId = document.getElementById(`tree-${id}`);
        const eleTop = treeId && treeId.getBoundingClientRect().top;
        const table = document.getElementById('side-bar');
        const tableTop = table.scrollTop;
        table.scrollTop = tableTop + eleTop - 200;
    }

    // 元素渲染
    renderElement(item, size) {
        const { id, css, text = '', imageList = [], label, name, extClass } = item;
        const { width, height } = size;
        // 折行处理
        const textList = text.split('\n');
        let attr = utils.objKeyFilter(item, ['element', 'id', 'css', 'text', 'maxlength']);
        attr = utils.objValFilter(attr, ['false']);
        const style = {
            ...utils.cssFilter(css, false),
            ...(width && { width }),
            ...(height && { height }),
        };
        switch (item.element) {
            // 容器
            case 'View':
                return (
                    <div id={id} className={classNames('element', 'view', id)} style={style}>
                        {this.props.children}
                    </div>
                );
            case 'ScrollView':
                return (
                    <div id={id} className={classNames('element', 'scroll-view', id)} style={style}>
                        {this.props.children}
                    </div>
                );
            case 'Swiper':
                return (
                    <div id={id} className={classNames('element', 'swiper', 'swiper-container', id)} style={style}>
                        <div className='swiper-wrapper'>
                            {imageList.map((url, idx) => (
                                <div key={`item-${idx}`} className='swiper-slide'>
                                    <img className='swiper-image' src={url} alt='' />
                                </div>
                            ))}
                        </div>
                        <div className='swiper-pagination'></div>
                    </div>
                );
            // 基础
            case 'Link':
                return (
                    <a id={id} className={classNames('element', 'link', id)} style={style}>
                        {this.props.children}
                    </a>
                );
            case 'Text':
                return (
                    <span id={id} className={classNames('element', 'text', id)} style={style}>
                        {textList.map((row, idx) => {
                            const arr = row.split('');
                            return textList.length > 1 ? (
                                <span key={`row-${idx}`} className='text-row'>
                                    {arr.map((span, i) => (
                                        <span key={`span-${i}`}>{span}</span>
                                    ))}
                                </span>
                            ) : (
                                arr.map((span, i) => <span key={`span-${i}`}>{span}</span>)
                            );
                        })}
                    </span>
                );
            case 'Icon':
                return <i id={id} className={classNames('element', 'icon', id, extClass)} style={style}></i>;
            // 表单
            case 'Form':
                return (
                    <div id={id} className={classNames('element', 'form', id)} style={style}>
                        {this.props.children}
                    </div>
                );
            case 'Input':
                return (
                    <input id={id} className={classNames('element', 'input', id)} style={style} type='text' {...attr} />
                );
            case 'Textarea':
                return (
                    <textarea
                        id={id}
                        className={classNames('element', 'textarea', id)}
                        style={style}
                        {...attr}
                    ></textarea>
                );
            case 'Checkbox':
                return (
                    <span className={classNames('element', 'checkbox', id)} style={style}>
                        <input id={id} type='checkbox' name={name} value={label} />
                        <span className='checkbox-label'>{label}</span>
                    </span>
                );
            case 'Radio':
                return (
                    <span className={classNames('element', 'radio', id)} style={style}>
                        <input id={id} type='radio' name={name} value={label} />
                        <span className='radio-label'>{label}</span>
                    </span>
                );
            case 'Select':
                return (
                    <div id={id} className={classNames('element', 'select', id)} style={style}>
                        请选择
                    </div>
                );
            case 'Upload':
                return (
                    <div id={id} className={classNames('element', 'upload', id)} style={style}>
                        {this.props.children}
                    </div>
                );
            case 'Submit':
                return (
                    <div id={id} className={classNames('element', 'submit', id)} style={style}>
                        {text}
                    </div>
                );
            // 媒体
            case 'Audio':
                return <audio id={id} className={classNames('element', 'audio', id)} style={style} {...attr}></audio>;
            case 'Video':
                return <video id={id} className={classNames('element', 'video', id)} style={style} {...attr}></video>;
            case 'Image':
                return <img id={id} className={classNames('element', 'image', id)} style={style} {...attr} />;

            default:
                return <div>default</div>;
        }
    }

    // 拖拽更改大小
    changeSize(evt) {
        this.setState({ isDown: true });
        const { clientX: startX, clientY: startY } = evt;
        const boxEle = this.refs.box;
        const { offsetWidth: boxWidth, offsetHeight: boxHeight } = boxEle;

        // 拖拽中
        window.onmousemove = e => {
            if (!this.state.isDown) return;
            const { clientX: movingX, clientY: movingY } = e;
            // 计算宽高
            const height = boxHeight + (movingY - startY) * 2;
            const width = Math.min(boxWidth + (movingX - startX) * 2, 750);
            this.setState({
                width: `${width}px`,
                height: `${height}px`,
            });
        };

        // 拖拽结束
        window.onmouseup = () => {
            const { width, height, isDown } = this.state;
            if (!isDown) return;
            this.setState({ isDown: false });
            // 结束时才更改树，要不会卡
            this.onStyleChange({ width, height });
        };
    }

    // 拖拽更改位置
    changePosition(evt) {
        this.setState({ isDown: true });
        const {
            canvasPosition: { ctxBottom },
        } = this.props.editorInfo;
        const boxEle = this.refs.box;
        const { clientX: startX, clientY: startY } = evt;
        // 元素位置大小
        const { offsetTop: boxTop, offsetLeft: boxLeft, offsetWidth: boxWidth, offsetHeight: boxHeight } = boxEle;

        // 拖拽中
        window.onmousemove = e => {
            if (!this.state.isDown) return;
            // 鼠标位置
            const { clientX: movingX, clientY: movingY } = e;
            // 改变值
            const changeX = (movingX - startX) * 2;
            const changeY = (movingY - startY) * 2;
            // 元素四边位置
            let top = Math.max(boxTop + changeY, 0); // 限制上侧
            const bottom = Math.max(top + boxHeight, ctxBottom - boxHeight);
            let left = Math.max(boxLeft + changeX, 0); // 限制左侧
            const right = Math.max(left + boxWidth, 750);
            if (right > 750) {
                // 超出右侧
                top = Math.min(top, ctxBottom - boxHeight - 20); // 超出下侧，限制top
                this.setState({ top: `${top}px`, left: `${750 - boxEle.offsetWidth}PX` });
            } else if (bottom + 20 > ctxBottom) {
                // 超出下侧
                left = Math.min(left, 750); // 超出右侧，限制left
                this.setState({ top: `${ctxBottom - boxHeight - 20}px`, left: `${left}px` });
            } else {
                this.setState({ top: `${top}px`, left: `${left}px` });
            }
        };

        // 拖拽结束
        window.onmouseup = () => {
            const { top, left, isDown } = this.state;
            if (!isDown) return;
            this.setState({ isDown: false });
            // 结束时才更改树，要不会卡
            this.onStyleChange({ top, left });
        };
    }

    // 样式更改
    onStyleChange(data) {
        const { elements, activeId } = this.props.editorInfo;
        const thisNode = utils.deepSearch(elements, activeId);
        const newNode = {
            css: {},
            ...thisNode,
        }
        for (let k in data) {
            newNode.css[k] = data[k];
        }
        const newElements = utils.deepUpdate(elements, { [activeId]: newNode });
        this.props.dispatch(elementsUpdate(newElements));
        this.props.dispatch(attributeUpdate(newNode));
    }

    render() {
        const { width, height, top, left } = this.state;
        const {
            item,
            editorInfo: {
                activeId,
                canvasPosition: { ctxWidth, ctxHeight },
                dialogMap,
            },
        } = this.props;
        const { id, css = {}, element } = item;
        const active = id == activeId;
        // 元素可以更改大小
        const canResize = !utils.has(['Text', 'Icon', 'Link', 'Radio', 'Checkbox'], element);
        switch (element) {
            // 根节点
            case 'Root':
                return (
                    <div
                        id='root'
                        className={classNames('root', { active })}
                        style={css}
                        onClick={this.selectNode.bind(this, 'root')}
                    >
                        {this.props.children}
                    </div>
                );
            // 弹层
            case 'Dialog':
                return (
                    <div
                        id={id}
                        className={classNames('h5-dialog', id, { active, none: !dialogMap[id] })}
                        style={{ width: ctxWidth, height: ctxHeight }}
                        onClick={this.selectNode.bind(this, id)}
                    >
                        {this.props.children}
                    </div>
                );
            // 默认
            default:
                return (
                    <div
                        className={classNames('ele-box', { active, 'can-resize': canResize })}
                        ref='box'
                        onClick={this.selectNode.bind(this, id)}
                        style={{
                            ...utils.cssFilter(css, true),
                            ...(top && { top }),
                            ...(left && { left }),
                            ...(width && { width }),
                            ...(height && { height }),
                        }}
                    >
                        {/*------ 缩放控制点 ------*/}
                        {canResize && (
                            <div className='ctrl-point right-botom' onMouseDown={this.changeSize.bind(this)} />
                        )}
                        {/*------ 位置控制点 ------*/}
                        {utils.has(canMoveList, css.position) && (
                            <div className='ctrl-point center' onMouseDown={this.changePosition.bind(this)} />
                        )}
                        {/*------ 宽高数字显示 ------*/}
                        {active && <div className='width-num'>{width || css.width}</div>}
                        {active && <div className='height-num'>{height || css.height}</div>}
                        {/*------ 选中展示边框 ------*/}
                        {this.renderElement(item, { width, height })}
                    </div>
                );
        }
    }
}

Element.defaultProps = {};

export default connect(
    ({ editorInfo }) => ({ editorInfo }),
    dispatch => ({ dispatch }),
)(Element);
