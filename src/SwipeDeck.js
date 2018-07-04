import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH / 3;

class SwipeDeck extends Component {
    static defaultProps = {
        onSwipeRight: () => { console.log('Swiped right. Please use onSwipeRight prop to hook up a function') },
        onSwipeLeft: () => { console.log('Swiped left. Please use onSwipeLeft prop to hook up a function.') }
    };

    constructor(props) {
        super(props);

        const position = new Animated.ValueXY({ x: 0.01, y: 0 });
        const deckAnim = new Animated.ValueXY({ x: 0.01, y: 0 });
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                // Activates any time a user presses the screen
                return true;
            },
            onPanResponderMove: (event, gesture) => {
                // Activates any time a user drags their finger across screen
                position.setValue({ x: gesture.dx });
            },
            onPanResponderRelease: (event, gesture) => {
                // Activates any time a user presses down, then lets go
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe('left');
                } else {
                    this.resetPosition();
                }
            }
        });

        this.panResponder = panResponder;
        this.position = position;
        this.deckAnim = deckAnim;

        this.state = { index: 0 };
    }

    render() {
        return (
            <Animated.View style={this.deckAnim.getLayout()}>
                {this.renderCards()}
            </Animated.View>
        );
    }

    renderCards() {
        return this.props.data.map((item, index) => {
            const currentCard = this.state.index;
            if (index === currentCard) {
                // Attach animation handler to current card
                return (
                    <Animated.View 
                        key={item.id}
                        style={this.getCardStyle()}
                        {...this.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            } else if (index > currentCard) {
                // Render rest of cards without attaching animation handler
                return (
                    <View key={item.id} style={{ backgroundColor: 'transparent' }}>
                        {this.props.renderCard(item)}
                    </View>
                );
            }

            // Don't render cards that have already been swiped away
            return null;
        });
    }

    getCardStyle() {
        const position = this.position;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
            outputRange: ['-120deg', '0deg', '120deg']
        });

        return {
            transform: [{ rotate }],
            ...position.getLayout()
        };
    }

    forceSwipe(direction) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.spring(this.position, {
            toValue: { x }
        }).start(this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const item = data[this.state.index];

        if (direction === 'right') {
            onSwipeRight(item);
        } else {
            onSwipeLeft(item);
        }

        Animated.timing(this.deckAnim, {
            toValue: { x: 0, y: 0 },
            duration: 100
        }).start(() => {
            this.position.setValue({ x: 0, y: 0 });
            this.deckAnim.setValue({ x: 0, y: 0 });
            this.setState({ index: this.state.index + 1 });
        });
    }

    resetPosition() {
        Animated.spring(this.position, {
            toValue: { x: 0.01, y: 0 }
        }).start();
    }
}

export default SwipeDeck;
