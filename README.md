# react-native-pickerView
  react-native上的滑动选择器，原理要点：
  - 使用手势控制滑动
  - 使用Animated的decay和timing动画实现滑动以及滑动结束自动匹配选择项的效果
  - 使用预加载+延迟加载来对长列表数据进行渲染
