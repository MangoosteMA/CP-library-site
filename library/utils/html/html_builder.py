from __future__ import annotations

from .rules import HtmlRuleInterface

class HtmlBuilder:
    '''
    Variables:
    children:  list[Edges]
    innerHtml: str
    parent:    HtmlBuilder
    '''

    TAB_SIZE = 4 # to make html prettier
    TAB_STR = ' ' * TAB_SIZE

    class Edge:
        '''
        Variables:
        rule:       HtmlRuleInterface
        parameters: dict[str, str]
        node:       HtmlBuilder
        '''

        def __init__(self, rule, parameters, node):
            self.rule = rule
            self.parameters = parameters
            self.node = HtmlBuilder() if node is None else node

    def __init__(self):
        self.children = []
        self.innerHtml = None
        self.parent = None

    def addEdge(self, rule: HtmlRuleInterface, destNode=None, **edgeParameters) -> HtmlBuilder:
        self.children.append(HtmlBuilder.Edge(rule, edgeParameters, node=destNode))
        self.children[-1].node.parent = self
        return self.children[-1].node

    def addMultipleEdges(self, rule: HtmlRuleInterface, innerHtml: list[str], **nodesParameters) -> None:
        for index, inner in enumerate(innerHtml):
            self.addEdge(rule, **dict([(name, arr[index]) for name, arr in nodesParameters.items()])).innerHtml = inner

    def htmlToStr(self) -> str:
        def dfsHtmlBuilder(node: HtmlBuilder, tabsNumber: int = 0) -> str:
            resultHtml = ''
            indention = HtmlBuilder.TAB_STR * tabsNumber
            if node.innerHtml is not None:
                resultHtml += indention + node.innerHtml

            for edge in node.children:
                nextLine = edge.rule.nextLineAfterHeaderAvailable()
                separator = '\n' if nextLine else ''
                curIndention = indention if nextLine else ''
                resultHtml += curIndention + edge.rule.buildHeader(edge.parameters) + separator
                resultHtml += dfsHtmlBuilder(edge.node, tabsNumber + 1 if nextLine else 0) + separator
                resultHtml += (curIndention if nextLine else '') + edge.rule.buildFooter(edge.parameters) + separator

            return resultHtml

        return dfsHtmlBuilder(self)
