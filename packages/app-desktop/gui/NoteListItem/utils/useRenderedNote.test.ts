import { act, renderHook } from "@testing-library/react";
import useRenderedNote from "./useRenderedNote";
import { ItemFlow, ListRenderer, ListRendererDependency } from "@joplin/lib/services/plugins/api/noteListType";

const mockListRenderer: ListRenderer = {
    id: "renderer-1",
    label: async () => "Test Renderer",
    itemSize: { width: 100, height: 50 },
    flow: ItemFlow.TopToBottom,
    dependencies: [] as ListRendererDependency[],
    itemCss: "",
    itemTemplate: "{{note.title}}",
    itemValueTemplates: {},
    onRenderNote: jest.fn(async (props: any) => props),
    onChange: jest.fn(),
    multiColumns: false,
};

jest.mock("@joplin/lib/models/Tag", () => ({
    __esModule: true,
    default: { tagsByNoteId: jest.fn(async (): Promise<any[]> => []) },
}));

jest.mock("@joplin/lib/models/Folder", () => ({
    __esModule: true,
    default: { load: jest.fn(async (): Promise<null> => null) },
}));

jest.mock("@joplin/lib/services/noteList/renderTemplate", () => ({
    __esModule: true,
    default: jest.fn(() => "<div>rendered</div>"),
}));

jest.mock("@joplin/lib/services/noteList/renderViewProps", () => ({
    __esModule: true,
    default: jest.fn(async () => {}),
}));

jest.mock("./getNoteTitleHtml", () => ({
    __esModule: true,
    default: jest.fn(() => "test title"),
}));

jest.mock("./prepareViewProps", () => ({
    __esModule: true,
    default: jest.fn(async (): Promise<any> => ({})),
}));

const defaultNote = {
    id: "note-1",
    title: "Test Note",
    updated_time: 1000,
    encryption_applied: 0,
    parent_id: "folder-1",
};

describe("useRenderedNote", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should return null initially", () => {
        const { result } = renderHook(() => useRenderedNote(
            defaultNote,
            false,
            false,
            mockListRenderer,
            [],
            0,
            null,
        ));

        expect(result.current).toBeNull();
    });

    test("should not cause infinite loop when rendered multiple times", async () => {
        const { rerender } = renderHook(
            (props: { note: any; isSelected: boolean }) => useRenderedNote(
                props.note,
                props.isSelected,
                false,
                mockListRenderer,
                [],
                0,
                null,
            ),
            { initialProps: { note: defaultNote, isSelected: false } },
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        const renderCount = (mockListRenderer.onRenderNote as jest.Mock).mock.calls.length;

        await act(async () => {
            rerender({ note: defaultNote, isSelected: false });
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        const newRenderCount = (mockListRenderer.onRenderNote as jest.Mock).mock.calls.length;
        expect(newRenderCount).toBe(renderCount);
    });

    test("should re-render when note changes", async () => {
        const { rerender } = renderHook(
            (props: { note: any }) => useRenderedNote(
                props.note,
                false,
                false,
                mockListRenderer,
                [],
                0,
                null,
            ),
            { initialProps: { note: defaultNote } },
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        const firstRenderCount = (mockListRenderer.onRenderNote as jest.Mock).mock.calls.length;

        await act(async () => {
            rerender({ note: { ...defaultNote, updated_time: 9999 } });
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        const secondRenderCount = (mockListRenderer.onRenderNote as jest.Mock).mock.calls.length;
        expect(secondRenderCount).toBeGreaterThan(firstRenderCount);
    });
});
