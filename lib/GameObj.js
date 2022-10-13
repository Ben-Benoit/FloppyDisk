"use strict";
import { TYPE, assertTypes, assertInstancesOf, getPropOrDefault,getNewElement, assertHasKey, assertDoesNotHaveKey, assertNotEmpty } from './Util.js';
import { Vector2, vector2 } from './Vector2.js';
import { Rect2, rect2 } from './Rect2.js'
import { Color } from './Color.js'
import { gameArea, gameContainer } from './Game.js'

const GAME_OBJECT = {} // id:gameObj

const IMAGE = {
    player: {src: "/images/FloppyDisk.png", size: vector2(18, 18)},
}

/**
 * @param {string} id - id key for image data (same as gameObjID)
 * @return {object} image data {src: string, size: Vector2}
 */
const getImageData = (id) => {
    assertHasKey(id, IMAGE);
    const imageData = IMAGE[id];
    assertHasKey("src", imageData);
    assertHasKey("size", imageData);
    return imageData;
}

/**
 * @param {string} id - id key for image data (same as gameObjID)
 * @return {Vector2} image dimensions
 */
const getImageSize = (id) => {
    return getImageData(id).size;
}

class GameObj {
    #rect2;
    #element = null;
    #velocity = Vector2.ZERO;

    /**
     * Create a GameObj with an associated HTMLElement.
     * @param {{id: string, classList?: Array, imgSrc?: string, rect2?: Rect2, backgroundColor?: Color}} dataObj - initializer data
     */
    constructor(dataObj) {
        this.register(dataObj, GAME_OBJECT);

        const tagName = getPropOrDefault(dataObj.tagName, TYPE.string, "game-object");
        this.#element = getNewElement(tagName);

        const gameObjID = dataObj.id;

        this.getElement.id = gameObjID;
        this.getElement.style.imageRendering = "pixelated";


        const classList = dataObj.classList;
        if (classList) {
            assertNotEmpty(classList);
            assertTypes(TYPE.string, ...classList);

            classList.forEach(_class => {
                this.getElement.classList.add(_class);
            })
        }

        const imgSrc = getPropOrDefault(dataObj.imgSrc, TYPE.string, "");

        const assignBackgroundColor = () => {
            const bgColor = getPropOrDefault(dataObj.backgroundColor, Color, Color.RED);
            this.getElement.removeAttribute("background-image");
            this.getElement.style.backgroundColor = bgColor.cssValueStr;
            this.setRect2 = getPropOrDefault(dataObj.rect2, Rect2, rect2(Vector2.ZERO, vector2(32, 32)));    
        }

        const assignImage = () => {
            this.getElement.removeAttribute("background-color");
            this.getElement.style.backgroundImage = `url(${imgSrc})`;
            const imgSize = getImageSize(gameObjID);
            const rect = getPropOrDefault(dataObj.rect2, Rect2, rect2(Vector2.ZERO, imgSize));
            rect.setSize = imgSize;
            this.setRect2 = rect;     
        }        

        if (imgSrc){
            assignImage();
        } else if (dataObj.backgroundColor) {
            assignBackgroundColor();
        } else if (dataObj.rect2) {
            this.setRect2 = dataObj.rect2;
        }
    }

    /** 
     * @param {Object} dataObj - the object argument passed to constructor
     * @param {Object} registryObj - the object to store a reference to this
     * */
    register(dataObj, registryObj) {
        assertTypes(TYPE.object, dataObj);
        assertHasKey("id", dataObj);
        const gameObjID = dataObj.id;

        assertDoesNotHaveKey(gameObjID, registryObj);
        registryObj[gameObjID] = this;
    }

    /** @return {Rect2} get the rect2 */
    get getRect2() {return this.#rect2}

    /** @return {Vector2} get the pos */
    get getPos() {return this.getRect2.getPos}

    /** @return {number} get the x coordinate */
    get getX() {return this.getRect2.getX}

    /** @return {number} get the y coordinate */
    get getY() {return this.getRect2.getY}

    /** @return {Vector2} get the size */
    get getSize() {return this.getRect2.getSize}

    /** @return {number} get the width */
    get getWidth() {return this.getRect2.getWidth}

    /** @return {number} get the height */
    get getHeight() {return this.getRect2.getHeight}

    /** @return {HTMLElement} get the size */
    get getElement() {return this.#element}    

    /** @return {Vector2} get the velocity */
    get getVelocity() {return this.#velocity}   

    /** @param {Rect2} value set the rect2 */
    set setRect2(value) {
        assertInstancesOf(Rect2, value);
        const copy = Rect2.copy(value);
        this.#rect2 = copy;
        this.setPos = copy.getPos;
        this.setSize = copy.getSize;
    }

    /** @param {Vector2} value set the pos */
    set setPos(value) {
        assertInstancesOf(Vector2, value);
        this.setX = value.getX;
        this.setY = value.getY;
    }

    /** @param {number} value set the x coordinate */
    set setX(value) {
        assertTypes(TYPE.number, value);
        this.getRect2.setX = value;
        this.getElement.style.left = `${value}px`;
    }

    /** @param {number} value set the y coordinate */
    set setY(value) {
        assertTypes(TYPE.number, value);
        this.getRect2.setY = value;
        this.getElement.style.top = `${value}px`;
    }

    /** @param {Vector2} value set the size */
    set setSize(value) {
        assertInstancesOf(Vector2, value);
        this.setWidth = value.getX;
        this.setHeight = value.getY;
    }

    /** @param {number} value set the width */
    set setWidth(value) {
        assertTypes(TYPE.number, value);
        this.getRect2.setWidth = value;
        if (value >= 0) {
            this.getElement.style.width = `${value}px`;
        }
    }

    /** @param {number} value set the height */
    set setHeight(value) {
        assertTypes(TYPE.number, value);
        this.getRect2.setHeight = value;
        if (value >= 0) {
            this.getElement.style.height = `${value}px`;
        }
    }

    /** @param {Vector2} value set the velocity */
    set setVelocity(value) {
        assertInstancesOf(Vector2, value);
        this.#velocity = Vector2.copy(value);
    }

    /** @param {Vector2} value offset the pos */
    offsetPos(value) {
        assertInstancesOf(Vector2, value);
        this.setPos = Vector2.getAdded(this.getPos, value);
    }

    /** @param {Vector2} value offset the velocity */
    offsetVelocity(value) {
        assertInstancesOf(Vector2, value);
        this.setVelocity = Vector2.getAdded(this.getVelocity, value);
    }

    /** add element to gameContainer */
    addToGame() {
        gameContainer.appendChild(this.getElement);
    }

    /** @return {number} get max y coordinate this object can move to before hitting game floor */
    get getMaxY() {
        return gameArea.getY - this.getHeight;
    }

    /** @return {number} get pos of top edge (getY) */
    get getTop() {return this.getRect2.getTop;}

    /** @return {number} get pos of bottom edge (top + height) */
    get getBottom() {return this.getRect2.getBottom;}

    /** @return {number} get pos of left edge (getX) */
    get getLeft() {return this.getRect2.getLeft;}

    /** @return {number} get pos of right edge (left + width) */
    get getRight() {return this.getRect2.getRight;}

    /** @return {Vector2} get pos of bottom-right edge (Vector2(getRight, getBottom)) */
    get getEndPos() {return this.getRect2.getEndPos;}

    /**
     * @param {GameObj} otherGameObj - otherGameObj
     * @return {boolean} Check if touches otherGameObj
     */
     touches(otherGameObj) {
        return this.getRect2.touches(otherGameObj.getRect2);
    }

    /**
     * @param {GameObj} otherGameObj - otherGameObj
     * @return {boolean} Check if overlaps otherGameObj
     */
     overlaps(otherGameObj) {
        return this.getRect2.overlaps(otherGameObj.getRect2);
    }

    /**
     * @param {GameObj} otherGameObj - otherGameObj
     * @return {boolean} Check if contains otherGameObj
     */
     contains(otherGameObj) {
        return this.getRect2.contains(otherGameObj.getRect2);
    }

}

export { GameObj, IMAGE };