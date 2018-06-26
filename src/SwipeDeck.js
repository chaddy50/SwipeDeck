import React, { Component } from 'react';
import { View, Animated, PanResponder } from 'react-native';

class SwipeDeck extends Component {
    constructor(props) {
        super(props);

        const position = new Animated.ValueXY();
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                // Activates any time a user presses the screen
                return true;
            },
            onPanResponderMove: (event, gesture) => {
                // Activates any time a user drags their finger across screen
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: () => {
                // Activates any time a user presses down, then lets go

            }
        });

        this.panResponder = panResponder;
        this.position = position;
    }

    render() {
        return (
            <Animated.View style={this.position.getLayout()} {...this.panResponder.panHandlers}>
                {this.renderCards()}
            </Animated.View>
        );
    }

    renderCards() {
        return this.props.data.map(item => {
            return this.props.renderCard(item);
        });
    }
}

export default SwipeDeck;
