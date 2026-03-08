import { act, renderHook } from "@testing-library/react";
import useScroll from "./useScroll";

const defaultListSize = { width: 200, height: 400 };
const defaultItemSize = { width: 200, height: 50 };

describe("useScroll", () => {
    let listRef: { current: HTMLDivElement };

    beforeEach(() => {
        const div = document.createElement("div");
        document.body.appendChild(div);
        listRef = { current: div };
    });

    afterEach(() => {
        listRef.current.remove();
    });

    test("should use latest noteCount value after rapid changes", () => {
        const { result, rerender } = renderHook(
            (props) => useScroll(props.itemsPerLine, props.noteCount, defaultItemSize, defaultListSize, listRef),
            { initialProps: { itemsPerLine: 1, noteCount: 610 } },
        );

        act(() => { rerender({ itemsPerLine: 1, noteCount: 5 }); });
        act(() => { rerender({ itemsPerLine: 1, noteCount: 3 }); });

        act(() => {
            result.current.makeItemIndexVisible(2);
        });

        expect(result.current.scrollTop).toBeGreaterThanOrEqual(0);
    });

    test("should update scrollTop when makeItemIndexVisible is called", () => {
        const { result } = renderHook(
            () => useScroll(1, 20, defaultItemSize, defaultListSize, listRef),
        );

        act(() => {
            result.current.makeItemIndexVisible(10);
        });

        expect(result.current.scrollTop).toBeGreaterThan(0);
    });
});
