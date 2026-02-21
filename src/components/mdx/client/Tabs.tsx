"use client";

import React from "react";

interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}

export function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "");

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentTabId: string,
  ) => {
    if (!tabs.length) return;

    const currentIndex = tabs.findIndex((tab) => tab.id === currentTabId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      }
      case "Home": {
        event.preventDefault();
        nextIndex = 0;
        break;
      }
      case "End": {
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      }
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    setActiveTab(nextTab.id);
    // Move focus to the newly selected tab button
    const nextTabElement = document.getElementById(`${nextTab.id}-tab`);
    nextTabElement?.focus();
  };

  return (
    <div className="my-6 not-prose">
      <div
        className="flex border-b border-border overflow-x-auto"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`${tab.id}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        className="py-4"
        role="tabpanel"
        id={activeTab ? `${activeTab}-panel` : undefined}
        aria-labelledby={activeTab ? `${activeTab}-tab` : undefined}
      >
        {activeTabData?.content}
      </div>
    </div>
  );
}
