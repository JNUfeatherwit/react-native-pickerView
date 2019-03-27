/**
 * Created by zzs on 2019/3/27 10:27.
 * file description:
 */
import React, { Component } from 'react'
import { Animated, InteractionManager, PanResponder, StyleSheet, Text, View, ViewPropTypes } from 'react-native'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { observable } from 'mobx'

const ITEM_HEIGHT = 28
@observer
class PickerView extends Component {
  static propTypes = {
    data: PropTypes.array,
    selectedIndex: PropTypes.number,
    selectedTextColor: PropTypes.string,
    textColor: PropTypes.string,
    onChange: PropTypes.func,
    containStyle: ViewPropTypes.style
  }
  static defaultProps = {
    selectedIndex: 0,
    selectedTextColor: '#666',
    textColor: '#ccc'
  }
  @observable curIndex = this.props.selectedIndex
  @observable loadLength = Math.min(this.props.data.length + 4, 40)
  get list() {
    return ['', ''].concat(this.props.data.slice()).concat(['', ''])
  }

  constructor(props) {
    super()
    this.initData()
  }
  componentWillMount() {
    this.verPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetResponder,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderEnd,
      onPanResponderTerminate: this.onPanResponderEnd
    })
  }
  componentDidMount() {
    if (this.list.length > this.loadLength) {
      InteractionManager.runAfterInteractions(() => {
        this.loadLength = this.list.length
      })
    }
  }
  initData = () => {
    this.position = new Animated.Value(-ITEM_HEIGHT * this.props.selectedIndex)
  }
  onStartShouldSetResponder = () => {
    this.position && this.position.removeAllListeners()
    return true
  }
  onPanResponderMove = (evt, gestureState) => {
    Animated.decay(this.position, {
      velocity: gestureState.vy, // 初速
      deceleration: 0.994 // 衰减加速度
    }).start()
  }

  onPanResponderEnd = (evt, gestureState) => {
    this.pathListener = this.position.addListener(listener => {
      if (listener.value > ITEM_HEIGHT || listener.value < -ITEM_HEIGHT * (this.list.length - 4)) {
        this.position.removeListener(this.pathListener)
        this.pathListener = null
        if (this.position._value > 0) {
          this.curIndex = 0
        } else {
          const index = Math.round(-this.position._value / ITEM_HEIGHT)
          const maxIndex = this.props.data.length - 1
          this.curIndex = index > maxIndex ? maxIndex : index
        }
        Animated.timing(this.position, {
          toValue: -this.curIndex * ITEM_HEIGHT,
          duration: 200
        }).start(() => {
          this.props.onChange && this.props.onChange(this.props.data[this.curIndex], this.curIndex)
        })
      }
    })
    InteractionManager.runAfterInteractions(() => {
      if (!this.pathListener) {
        return
      }
      if (this.position._value > 0) {
        this.curIndex = 0
      } else {
        const index = Math.round(-this.position._value / ITEM_HEIGHT)
        const maxIndex = this.props.data.length - 1
        this.curIndex = index > maxIndex ? maxIndex : index
      }
      Animated.timing(this.position, {
        toValue: -this.curIndex * ITEM_HEIGHT,
        duration: 100
      }).start(() => {
        this.props.onChange && this.props.onChange(this.props.data[this.curIndex], this.curIndex)
      })
    })
  }
  render() {
    const { containStyle,selectedTextColor,textColor } = this.props
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={[styles.container, containStyle]}>
          <View
            style={[{ height: ITEM_HEIGHT * 5, borderWidth: 0, minWidth: 30 }]}
            {...this.verPanResponder.panHandlers}
          >
            <Animated.View style={{ transform: [{ translateY: this.position }] }}>
              {this.list.slice(0, this.loadLength).map((value, index) => (
                <View style={[styles.itemView, { height: ITEM_HEIGHT }]} key={index.toString()}>
                  <Text
                    style={{
                      color: this.curIndex + 2 === index ? selectedTextColor : textColor,
                      fontITEM_HEIGHT: this.curIndex + 2 === index ? 15 : 14
                    }}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 8
  },
  selectedContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    position: 'absolute',
    backgroundColor: '#dfdfdf'
  },
  itemView: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
export default PickerView
