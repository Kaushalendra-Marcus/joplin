import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import { ItemFlow } from '@joplin/lib/services/plugins/api/noteListType';
import useItemElement from './useItemElement';

const defaultProps = {
    noteId: 'note-1',
    noteHtml: '<div>test</div>',
    focusVisible: false,
    style: { color: 'red' } as React.CSSProperties,
    itemSize: { width: 100, height: 50 },
    onClick: jest.fn(),
    onDoubleClick: jest.fn(),
    flow: ItemFlow.TopToBottom,
};

describe('useItemElement', () => {
    let rootElement: HTMLDivElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        document.body.appendChild(rootElement);
    });

    afterEach(() => {
        rootElement.remove();
    });

    test('should create element when rootElement is provided', () => {
        const { result } = renderHook(() => useItemElement(
            rootElement,
            defaultProps.noteId,
            defaultProps.noteHtml,
            defaultProps.focusVisible,
            defaultProps.style,
            defaultProps.itemSize,
            defaultProps.onClick,
            defaultProps.onDoubleClick,
            defaultProps.flow,
        ));

        expect(result.current).not.toBeNull();
        expect(result.current?.getAttribute('data-id')).toBe('note-1');
        expect(result.current?.className).toBe('note-list-item');
    });

    test('should not recreate element when onClick changes', () => {
        const { result, rerender } = renderHook(
            (props) => useItemElement(
                rootElement,
                props.noteId,
                props.noteHtml,
                props.focusVisible,
                props.style,
                props.itemSize,
                props.onClick,
                props.onDoubleClick,
                props.flow,
            ),
            { initialProps: defaultProps },
        );

        const firstElement = result.current;

        act(() => {
            rerender({ ...defaultProps, onClick: jest.fn() });
        });

        expect(result.current).toBe(firstElement);
    });

    test('should update innerHTML when noteHtml changes without recreating element', () => {
        const { result, rerender } = renderHook(
            (props) => useItemElement(
                rootElement,
                props.noteId,
                props.noteHtml,
                props.focusVisible,
                props.style,
                props.itemSize,
                props.onClick,
                props.onDoubleClick,
                props.flow,
            ),
            { initialProps: defaultProps },
        );

        const firstElement = result.current;

        act(() => {
            rerender({ ...defaultProps, noteHtml: '<div>updated</div>' });
        });

        expect(result.current).toBe(firstElement);
        expect(result.current?.innerHTML).toBe('<div>updated</div>');
    });

    test('should add focus-visible class when focusVisible is true', () => {
        const { result, rerender } = renderHook(
            (props) => useItemElement(
                rootElement,
                props.noteId,
                props.noteHtml,
                props.focusVisible,
                props.style,
                props.itemSize,
                props.onClick,
                props.onDoubleClick,
                props.flow,
            ),
            { initialProps: defaultProps },
        );

        expect(result.current?.classList.contains('-focus-visible')).toBe(false);

        act(() => {
            rerender({ ...defaultProps, focusVisible: true });
        });

        expect(result.current?.classList.contains('-focus-visible')).toBe(true);
    });

    test('should call latest onClick when clicked', () => {
        const firstClick = jest.fn();
        const secondClick = jest.fn();

        const { result, rerender } = renderHook(
            (props) => useItemElement(
                rootElement,
                props.noteId,
                props.noteHtml,
                props.focusVisible,
                props.style,
                props.itemSize,
                props.onClick,
                props.onDoubleClick,
                props.flow,
            ),
            { initialProps: { ...defaultProps, onClick: firstClick } },
        );

        act(() => {
            rerender({ ...defaultProps, onClick: secondClick });
        });

        act(() => {
            result.current?.click();
        });

        expect(firstClick).not.toHaveBeenCalled();
        expect(secondClick).toHaveBeenCalled();
    });
});
