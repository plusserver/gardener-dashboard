<!--
Copyright (c) 2020 by SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<template>
  <div>
    <v-list-item>
      <v-list-item-icon>
        <icon-base width="24" height="23" iconColor="#0097a7" viewBox="-4 0 56 54">
          <terminal-shortcut-icon></terminal-shortcut-icon>
        </icon-base>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Terminal Shortcuts</v-list-item-title>
        <v-list-item-subtitle>Launch preconfigured terminals for frequently used views</v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action class="mx-0">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon @click.native.stop="expansionPanel = !expansionPanel">
              <v-icon>{{expansionPanelIcon}}</v-icon>
            </v-btn>
          </template>
          <span>{{expansionPanelTooltip}}</span>
        </v-tooltip>
      </v-list-item-action>
    </v-list-item>
    <v-card v-if="expansionPanel" flat class="ml-14 mt-2">
      <v-card-text class="pa-0">
        <terminal-shortcuts
          :shoot-item="shootItem"
          :popper-boundaries-selector="popperBoundariesSelector"
          @addTerminalShortcut="onAddTerminalShortcut"
        ></terminal-shortcuts>
      </v-card-text>
    </v-card>
    <unverified-terminal-shortcuts-dialog
      ref="unverified"
    ></unverified-terminal-shortcuts-dialog>
  </div>
</template>

<script>

import TerminalShortcuts from '@/components/TerminalShortcuts'
import IconBase from '@/components/icons/IconBase'
import TerminalShortcutIcon from '@/components/icons/TerminalShortcutIcon'
import UnverifiedTerminalShortcutsDialog from '@/components/dialogs/UnverifiedTerminalShortcutsDialog'

export default {
  props: {
    shootItem: {
      type: Object
    },
    popperBoundariesSelector: {
      type: String
    }
  },
  data () {
    return {
      expansionPanel: false
    }
  },
  components: {
    TerminalShortcuts,
    IconBase,
    TerminalShortcutIcon,
    UnverifiedTerminalShortcutsDialog
  },
  computed: {
    expansionPanelIcon () {
      return this.expansionPanel ? 'mdi-chevron-up' : 'mdi-chevron-down'
    },
    expansionPanelTooltip () {
      return this.expansionPanel ? 'Hide terminal shortcuts' : 'Show terminal shortcuts'
    }
  },
  methods: {
    async onAddTerminalShortcut (shortcut) {
      if (shortcut.unverified) {
        const confirmation = await this.$refs.unverified.promptForConfirmation()
        if (!confirmation) {
          return
        }
      }
      this.$emit('addTerminalShortcut', shortcut)
    }
  }
}
</script>