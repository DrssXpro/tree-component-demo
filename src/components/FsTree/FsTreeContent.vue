<script lang="ts">
import { PropType, defineComponent, h, inject } from "vue";
import { ITreeNode } from "./types";

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<ITreeNode>,
      required: true,
    },
  },
  setup(props) {
    const node = props.node;
    const { slots } = inject("RootTreeSlots") as any;
    return () => h("div", null, slots.default ? slots.default({ node }) : h("span", null, props.node.label));
  },
});
</script>
