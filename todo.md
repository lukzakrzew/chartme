handle empty state - when nothing is added yet
add some "learn more" to make new users easier to start

make everything a bit smaller
export gave not my real data but test data WTF?

bellow the toggle add new toggle "Change order"
its value by default will be false
its value will be stored in store but not in local storage
after refesh it will be false

when this is true:
show up and down button icons on each LogTypeItem
when user clicks it should change "order" value in this LogType and other LogTypes in the same category

you need to add "order" prop to LogType it should be number | undefined because users already use my app and their LogTypes may have not this prop set

LogTypes should be ordered inside a category by order prop

when user click on an arrow app should change order prop for this item and for other items from its category

ns
d
b
w
