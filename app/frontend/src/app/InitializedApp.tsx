/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  IModelApp, IModelConnection, NotifyMessageDetails, OutputMessagePriority, OutputMessageType,
} from "@bentley/imodeljs-frontend";
import {
  ChildNodeSpecificationTypes, ContentSpecificationTypes, RegisteredRuleset, Ruleset, RuleTypes,
} from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import { WidgetState } from "@bentley/ui-abstract";
import { MessageManager, MessageRenderer } from "@bentley/ui-framework";
import { BackendApi } from "../api/BackendApi";
import { Frontstage } from "../ui-framework/Frontstage";
import { StagePanel, StagePanelZone } from "../ui-framework/StagePanel";
import { UIFramework } from "../ui-framework/UIFramework";
import { Widget } from "../ui-framework/Widget/Widget";
import { AppLayoutContext, appLayoutContext, AppTab, backendApiContext } from "./AppContext";
import { ContentTabs } from "./ContentTabs";
import { IModelSelector } from "./imodel-selector/IModelSelector";
import { PropertyGrid } from "./property-grid/PropertyGrid";
import { Tree } from "./tree/Tree";

export interface InitializedAppProps {
  backendApi: BackendApi;
}

export function InitializedApp(props: InitializedAppProps): React.ReactElement {
  const appLayoutContextValue = useAppLayout();

  const [imodelPath, setIModelPath] = React.useState("");
  const imodel = useIModel(props.backendApi, imodelPath);

  const [initialRulesetText] = React.useState(() => JSON.stringify(defaultRuleset, undefined, 2));
  const [ruleset, setRuleset] = React.useState(defaultRuleset);
  const registeredRuleset = useRegisteredRuleset(ruleset);

  async function submitRuleset(newRuleset: Ruleset): Promise<void> {
    setRuleset(newRuleset);
  }

  return (
    <backendApiContext.Provider value={props.backendApi}>
      <appLayoutContext.Provider value={appLayoutContextValue}>
        <IModelSelector selectedIModelPath={imodelPath} setSelectedIModelPath={setIModelPath} />
        <div>
          <UIFramework>
            <Frontstage
              rightPanel={
                <StagePanel size={450}>
                  <StagePanelZone>
                    <Widget
                      id="TreeWidget"
                      label={IModelApp.i18n.translate("App:label:tree-widget")}
                      defaultState={WidgetState.Open}
                    >
                      {imodel && registeredRuleset && <Tree imodel={imodel} ruleset={registeredRuleset} />}
                    </Widget>
                  </StagePanelZone>
                  <StagePanelZone>
                    <Widget
                      id="PropertyGridWidget"
                      label={IModelApp.i18n.translate("App:label:property-grid-widget")}
                      defaultState={WidgetState.Open}
                    >
                      {imodel && registeredRuleset && <PropertyGrid imodel={imodel} ruleset={registeredRuleset} />}
                    </Widget>
                  </StagePanelZone>
                </StagePanel>
              }
            >
              <ContentTabs imodel={imodel} defaultRuleset={initialRulesetText} submitRuleset={submitRuleset} />
            </Frontstage>
          </UIFramework>
          <MessageRenderer />
        </div>
      </appLayoutContext.Provider>
    </backendApiContext.Provider>
  );
}

const defaultRuleset: Ruleset = {
  id: "Ruleset1",
  supportedSchemas: {
    schemaNames: [
      "BisCore",
      "Functional",
    ],
  },
  rules: [
    {
      ruleType: RuleTypes.RootNodes,
      specifications: [{
        specType: ChildNodeSpecificationTypes.InstanceNodesOfSpecificClasses,
        classes: {
          schemaName: "Functional",
          classNames: ["FunctionalElement"],
        },
        arePolymorphic: true,
        groupByClass: true,
        groupByLabel: false,
      }],
    },
    {
      ruleType: RuleTypes.Content,
      specifications: [{ specType: ContentSpecificationTypes.SelectedNodeInstances }],
    },
  ],
};

function useRegisteredRuleset(ruleset: Ruleset): RegisteredRuleset | undefined {
  const [registeredRuleset, setRegisteredRuleset] = React.useState<RegisteredRuleset>();
  React.useEffect(
    () => {
      setRegisteredRuleset(undefined);

      let disposed = false;
      let registeredRulesetPromise: Promise<RegisteredRuleset>;

      void (async () => {
        registeredRulesetPromise = Presentation.presentation.rulesets().add(ruleset);
        if (!disposed) {
          setRegisteredRuleset(await registeredRulesetPromise);
        }
      })();

      return () => {
        disposed = true;
        void (async () => {
          await Presentation.presentation.rulesets().remove(await registeredRulesetPromise);
        })();
      };
    },
    [ruleset],
  );

  return registeredRuleset;
}

function useAppLayout(): AppLayoutContext {
  const [activeTab, setActiveTab] = React.useState(AppTab.Editor);
  return React.useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);
}

function useIModel(backendApi: BackendApi, path: string): IModelConnection | undefined {
  const [imodel, setIModel] = React.useState<IModelConnection>();

  React.useEffect(
    () => {
      let disposed = false;
      let imodelPromise: Promise<IModelConnection | undefined>;
      void (async () => {
        try {
          imodelPromise = (path === "" ? Promise.resolve(undefined) : backendApi.openIModel(path));
          const openedIModel = await imodelPromise;
          if (!disposed) {
            setIModel(openedIModel);
          }
        } catch (error) {
          displayErrorToast(IModelApp.i18n.translate("App:error:imodel-open", { imodel: path }), error.message);
        }
      })();

      return () => {
        disposed = true;
        void (async () => {
          try {
            const openedIModel = await imodelPromise;
            if (openedIModel !== undefined) {
              await openedIModel.close();
            }
          } catch (error) {
            displayErrorToast(IModelApp.i18n.translate("App:error:imodel-close", { imodel: path }), error.message);
          }
        })();
      };
    },
    [backendApi, path],
  );

  return imodel;
}

function displayErrorToast(messageShort: string, messageDetail: string): void {
  const messageDetails = new NotifyMessageDetails(
    OutputMessagePriority.Error,
    messageShort,
    messageDetail,
    OutputMessageType.Toast,
  );
  MessageManager.outputMessage(messageDetails);
}
