/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ContentDataProvider } from "@itwin/presentation-components";
import type { DescriptorOverrides, Keys, Ruleset} from "@itwin/presentation-common";
import { ContentFlags, KeySet } from "@itwin/presentation-common";
import type { IModelConnection } from "@itwin/core-frontend";

class RulesetDrivenIdsProvider extends ContentDataProvider {
  constructor(imodel: IModelConnection, ruleset: Ruleset, displayType: string, inputKeys: KeySet) {
    super({ imodel, ruleset: ruleset, displayType });
    this.keys = inputKeys;
  }
  protected shouldConfigureContentDescriptor() { return false; }

  protected override async getDescriptorOverrides(): Promise<DescriptorOverrides> {
    return Promise.resolve({
      displayType: this.displayType,
      contentFlags: ContentFlags.KeysOnly,
    });
  }

  public async getRelatedNodes(): Promise<KeySet> {
    const content = await this.getContent();
    const result = new KeySet();
    if (content) {
      content.contentSet.forEach((item) => {
        result.add(item.primaryKeys);
      });
    }
    return result;
  }
}

// istanbul ignore next
export class RelatedElementIdsProvider extends RulesetDrivenIdsProvider {
  constructor(imodel: IModelConnection, ruleset: Ruleset, nodeKeys: KeySet) {
    super(imodel, ruleset, "RelatedElementsRequest", nodeKeys);
  }
}
