<demo>
    一键打开 Dialog
 </demo>
<template>
    <div>
        <Button @click="showDialog">打开对话框</Button>
    </div>
</template>

<script lang="ts">
import { Dialog, Button } from '../../lib/index';
import {
    h
} from 'vue'
import {
    openDialog
} from '../../lib/openDialog'
export default {
    components: {
        Button,
        Dialog
    },
    setup() {
        const showDialog = () => {
            openDialog({
                title: h('strong', {}, '标题'),
                content: '你好',
                ok() {
                    console.log('ok')
                },
                cancel() {
                    console.log('cancel')
                }
            })
        }
        return {
            showDialog
        }
    }
}
</script>