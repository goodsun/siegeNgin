# siegeNgin from the Perspective of Symbol Emergence Systems Theory: Symbol Emergence between Humans and AI through Pointing Acts

## Abstract

This paper theoretically analyzes siegeNgin, a novel human-computer interaction system that integrates Chrome extensions with AI collaboration, from the perspective of symbol emergence systems theory. The "pointing act" in siegeNgin functions not merely as a technical input method, but as an innovative mechanism that serves as a practical solution to the symbol grounding problem and promotes symbol emergence between humans and AI. This study employs symbol emergence robotics by Tadahiro Taniguchi, Wittgenstein's language game theory, and Gibson's affordance theory as theoretical foundations to examine the "decentralization of symbol emergence" realized by siegeNgin. In particular, we discuss how direct pointing acts toward DOM elements endow abstract HTML structures with meaning, enabling direct meaning generation that does not depend on technical authority. Furthermore, through theoretical connections with Husserlian phenomenology and Gadamerian hermeneutics, detailed analysis of security architecture, and presentation of quantitative evaluation data, we demonstrate the interdisciplinary validity of this theory. Additionally, we introduce the Collective Predictive Coding (CPC) hypothesis proposed by Taniguchi et al. as a framework, showing that the symbol emergence process between humans and AI in siegeNgin can be described as a collective extension of predictive coding.

**Keywords**: Symbol emergence, Pointing, Human-AI collaboration, Symbol grounding problem, Affordance, Meaning generation, Phenomenology, Direct Manipulation, Collective Predictive Coding

## 1. Introduction

### 1.1 Epistemological Premise: The Recursivity of Discussing Symbol Emergence with Symbols

Prior to this paper, we must clarify its epistemological premises.

Symbol emergence systems theory deals with "how meaning (symbols) emerges." However, this theory itself is also described using symbols. Discussing symbol emergence with symbols—this recursive structure means that complete description of symbol emergence is fundamentally impossible, much like how Gödel's incompleteness theorem showed the limits of formal systems.

This should be consciously treated as a theoretical limitation that is an important problem. The self-referential structure provides clues for clarifying the scope and limitations of symbol emergence systems theory.

In conventional academic evaluation, quantitative empirical data and reproducible measurements are emphasized. However, the moment we attempt to quantify symbol emergence, it becomes constrained within existing symbol systems, and the essence of emergence—the unpredictable appearance of new meaning—is lost. While quantifying all aspects of symbol emergence is fundamentally difficult, this study demonstrates validity through theoretical consistency and structural describability.

So how do we discuss the unmeasurable?

The answer has already been demonstrated by siegeNgin: **"Point"**.

When humans encounter something that cannot be verbalized, they return to the most primitive act. They point to the object and say "this." This "this (deixis)" is called deixis (demonstrative expression) in linguistics and represents the most primordial act by which symbols become grounded in the real world. The pointing in siegeNgin is precisely a digital implementation of this primordial symbol grounding act.

This paper takes the position of recognizing the significance of discussing with symbols while being conscious of this recursivity and acknowledging the limitations of symbols. This is also a contemporary practice of what Siddhartha taught as "self-reliance and dharma-reliance (自灯明・法灯明)"—relying not on authority but on one's direct experience and the laws of the world [11].

### 1.2 Problem Statement

In the digital society of the 21st century, the interaction between humans and computers has evolved from conventional input-output models to more complex and mutual collaborative relationships. Particularly, with the rapid development of Large Language Models (LLMs) and generative AI, human-AI communication has entered a new phase.

siegeNgin, which this paper focuses on, is an innovative collaborative system integrating Chrome extensions, server-side processing, and Gemini AI. Its most distinctive feature is that users can directly "point" at DOM elements on browsers and give instructions in natural language, allowing AI to automatically execute web operations.

This seemingly simple mechanism contains extremely interesting phenomena from the perspective of symbol emergence systems theory. Pointing acts function as concrete meaning-attribution acts toward abstract digital structures (HTML/DOM), serving as practical solutions to the symbol grounding problem that establishes correspondence relationships between symbols and the real world.

More importantly, this system operates based on the principle of "direct understanding without authority." Conventional content management systems (CMS) and programming-based web development have relied on meaning generation dependent on the "authority" of technical expertise. However, siegeNgin enables users to directly question the "world itself" (web pages) and collaborate with AI through natural language as a universal symbol system.

This paper analyzes the architecture of siegeNgin using symbol emergence systems theory as its theoretical foundation and clarifies the novel symbol emergence mechanisms that this system realizes. Particularly in the R5 revision, we introduce the Collective Predictive Coding (CPC) hypothesis proposed by Taniguchi et al. [24][25] as a new theoretical lens to re-describe symbol emergence between humans and AI in siegeNgin as a collective extension of predictive coding.

## 2. Theoretical Background

### 2.1 Symbol Emergence Systems Theory

Symbol emergence is a theoretical framework by Tadahiro Taniguchi that deals with processes in which meaning spontaneously emerges from interactions among multiple agents [1]. Its core characteristics are distributivity, emergence, self-organization, and adaptability.

### 2.2 Symbol Grounding Problem

The symbol grounding problem, formulated by Harnad (1990), is a fundamental problem in cognitive science: "How are symbols linked to objects or concepts in the real world?" [2]. This problem has been discussed as a necessary condition for AI systems to reach true understanding beyond mere symbol manipulation.

#### 2.2.1 Conventional Grounding Concepts

Conventional symbol grounding theories defined grounding as "sensorimotor coupling with physical environments" involving elements of perceptual input, embodiment, environmental interaction, and categorization, with limited application to digital environments.

#### 2.2.2 Extension of Grounding Concepts: Grounding as Prediction Error Constraint

This paper extends the concept of symbol grounding to a more general form. Grounding is redefined as "coupling with external structures that constrain prediction errors." This redefinition naturally extends the scope of symbol emergence theory to digital environments.

Conventional physical grounding is positioned as a special case of this generalized grounding. While physical environments certainly constrain prediction errors, they are not the only constraining structures. DOM structures, database schemas, programming language grammars—all of these function as external structures that constrain the prediction errors of generative models in specific directions.

This extended grounding concept theoretically grounds symbol emergence in digital collaborative systems like siegeNgin and shows a path for symbol emergence systems theory to develop as a general theory encompassing human-AI collaboration in the digital age.

### 2.3 Wittgenstein's Language Games

Wittgenstein's language game theory asserts that "meaning is use," characterized by context dependency, practical usage, flexible rules, and communal meaning sharing [3].

### 2.4 Gibson's Affordance Theory

Gibson's affordance theory deals with possibilities for action that environments provide, characterized by environment-actor relationality, direct perception, action-inducing properties, and ecological validity [4].

### 2.5 Direct Manipulation and Conversational UI

To accurately position siegeNgin's interaction model, it is necessary to clarify its relationship with two major paradigms in the HCI field—Direct Manipulation and Conversational UI.

Direct Manipulation proposed by Shneiderman (1983) is characterized by three principles [12]:
1. Continuous representation of objects of interest
2. Physical actions or labeled button presses instead of complex syntax
3. Rapid, incremental, reversible operations whose impact is immediately visible

This principle theoretically justified the transition from Command Line Interface (CLI) to GUI and became the design foundation for modern WYSIWYG editors and spreadsheets. The strength of Direct Manipulation lies in reducing users' cognitive load and maintaining direct correspondence between objects and operations.

On the other hand, Conversational UI is a design paradigm that uses natural language as the primary means of interaction. In the lineage from Apple Siri (2011), Amazon Alexa (2014), to ChatGPT (2022), Conversational UI has the strength of "flexible expression of complex intentions," but the following limitations have been pointed out [13]:
- Referential ambiguity: It's unclear what "that part" refers to in "change that part"
- Lack of visibility: Operable objects are not visible
- Delayed feedback: Unable to immediately confirm operation results

siegeNgin realizes a hybrid interaction model that integrates these two paradigms. Specifically:

- **Direct Manipulation layer**: By pointing (clicking) DOM elements, operation targets are directly and explicitly specified. This satisfies Shneiderman's "continuous representation of objects" and "physical actions."
- **Conversational UI layer**: Natural language description of intentions enables flexible expression of complex operations. This eliminates the need to learn formal command systems.

This hybrid structure fundamentally solves the referential ambiguity problem of Conversational UI. In the instruction "make this red," "this" is uniquely identified through pointing. The ambiguity of natural language is supplemented by the explicitness of Direct Manipulation, while the limitations of Direct Manipulation's expressiveness are extended by the flexibility of natural language.

The "feeling of directness" discussed by Hutchins, Hollan & Norman (1985) [14] depends on interface transparency—the sensation that users are manipulating objects themselves without being conscious of the interface's existence. In siegeNgin, the combination of pointing + natural language realizes this "feeling of directness" toward web pages as objects at an extremely high level. Users operate "what they see" "with words" without being conscious of mediation layers such as HTML, CSS, and JavaScript.

### 2.6 Connection with Phenomenology and Hermeneutics

In deepening the theoretical analysis of siegeNgin, dialogue with the continental philosophical tradition—particularly phenomenology and hermeneutics—is indispensable. While Wittgenstein and Gibson belong to the Anglo-American analytic tradition, Husserl, Heidegger, and Gadamer belong to the continental phenomenological tradition. By positioning siegeNgin at the intersection of both traditions, we can grasp its theoretical significance more three-dimensionally.

#### 2.6.1 Husserlian Phenomenology: "To the Things Themselves" and Pointing

Husserl's phenomenological slogan "To the things themselves" (Zu den Sachen selbst) calls for returning to direct experience, eliminating preconceptions and theoretical presuppositions [15]. Husserl called this method "phenomenological reduction," aiming to describe phenomena as they appear to consciousness by "bracketing" implicit assumptions in the natural attitude—naive belief in the reality of the world (epoché).

The pointing act in siegeNgin can be interpreted as a digital implementation of this phenomenological attitude. The act of users pointing at DOM elements is an act that "brackets" technical presuppositions such as HTML structure and CSS rules and directly approaches web page elements as they visually appear. While conventional web development was conducted within the "natural attitude" of technical knowledge, siegeNgin enables epoché (suspension of judgment) of technical authority.

This similarity is not coincidental. The "description without preconceptions" that Husserl aimed for and the "direct operation without technical authority" that siegeNgin realizes are structurally homologous. Both are endeavors that eliminate dependence on indirect theoretical systems and seek to recover direct relationships with objects themselves.

#### 2.6.2 Gadamerian Hermeneutics: Fusion of Horizons and Symbol Emergence

The central concept of "fusion of horizons" (Horizontverschmelzung) in Gadamer's philosophical hermeneutics describes the process in which understanding occurs as a fusion of "the interpreter's horizon" and "the text's horizon" [16]. Understanding is a process in which new meaning—irreducible to either horizon—emerges by risking one's own prejudices (Vorurteil) and encountering the other's horizon.

Symbol emergence between humans and AI in siegeNgin vividly embodies this structure of fusion of horizons. The "horizon of intention" that humans possess (what they want to realize, why it's important, in what context they operate) and the "technical horizon" that AI possesses (DOM structure analysis capability, knowledge of operation patterns, optimization reasoning ability) meet and fuse, leading to the emergence of new operational meaning that cannot be reduced to either horizon.

What's important is that Gadamer understood understanding not as "one-sided reproduction" but as "productive creation." In siegeNgin too, AI does not simply "reproduce" human intentions but "productively" proposes operation methods that humans had not explicitly anticipated through DOM structure analysis and operation optimization. In this sense, the collaborative process of siegeNgin can be seen as a technical implementation of the hermeneutical circle.

#### 2.6.3 Heidegger's Tool Analysis: From Ready-to-Hand to Present-at-Hand

Heidegger's tool analysis in "Being and Time" provides the most precise phenomenological description of the pointing act in siegeNgin [17].

Heidegger argued that in everyday tool use, tools function as "ready-to-hand" (Zuhandenheit). When hammering nails, the hammer is not the object of conscious attention but "withdraws" as a transparent medium of action. However, when a tool breaks or doesn't function as expected, the tool stands out as "present-at-hand" (Vorhandenheit)—that is, as an object of observation and analysis.

DOM elements on web pages function as "ready-to-hand" in ordinary browsing activities. Users read text and click links without being conscious that they are structured as div elements or a elements. DOM structure is the transparent medium of web browsing as an everyday practice.

The pointing act in siegeNgin is an intentional act that transforms these DOM elements as "ready-to-hand" into "present-at-hand." The moment a user points at an element, that element changes its mode of being from a transparent medium of web browsing to an object of operation and analysis. However—and this is the uniqueness of siegeNgin—this transformation is not the passive transformation through "breakdown" that Heidegger described, but an active transformation through the active act of pointing.

More importantly, siegeNgin enables natural language meaning-attribution to elements that have been made manifest as "present-at-hand." In Heidegger's schema, "present-at-hand" belongs to the theoretical attitude and scientific stance. However, in siegeNgin, elements that have been made manifest as "present-at-hand" are immediately re-transformed into new "ready-to-hand"—as objects of operation. The cycle of pointing → natural language instruction → AI operation → result confirmation can be described as a dialectical movement of Zuhandenheit → Vorhandenheit → new Zuhandenheit.

### 2.7 Introduction of the CPC Hypothesis (Collective Predictive Coding)

The theory that provides the computational foundation for symbol emergence systems theory is the Collective Predictive Coding (CPC) hypothesis. Tadahiro Taniguchi et al. extended the framework of Predictive Coding in neuroscience from the individual level to the collective level, reformulating the emergence of symbols (language) as "collective prediction error minimization by multiple agents" [24][25][26].

#### 2.7.1 Basics of Predictive Coding

Predictive coding is a neuroscientific hypothesis that the brain functions not as a passive perceiver of the external world, but as a system that actively constructs predictive models and minimizes discrepancies between predictions and reality (prediction errors). Specifically, in the brain's hierarchical structure:
- **Top-down signals**: Predictions from upper layers to lower layers ("this is how it should look")
- **Bottom-up signals**: Prediction errors from lower layers to upper layers ("different from prediction")
- **Learning**: Updating internal models to minimize prediction errors

#### 2.7.2 From Individual to Collective: Basic Structure of CPC

The core of the CPC hypothesis lies in extending this predictive coding framework to communication among multiple agents. Each agent has their own "model of the world" (internal representation, generative model) and attempts to collectively minimize prediction errors through interactions with others. The detailed theoretical structure will be elaborated in Chapter 4 (to avoid duplication between 2.7 and Chapter 4 CPC content, only basic definitions are presented here).

## 3. siegeNgin Architecture

### 3.1 System Configuration

siegeNgin consists of a three-layer architecture: Chrome extension (pointing and UI), server layer (OTP authentication and Git management), and Gemini AI (language understanding, DOM analysis, and action generation).

### 3.2 Technical Flow

siegeNgin's operational process: Pointing → Data extraction → Natural language input → AI analysis → Operation execution → Feedback.

### 3.3 Security, Error Handling, and Privacy

siegeNgin implements a multi-layered defense architecture against the risks inherent in "tools that can do anything." We detail each aspect of security, error handling, and privacy.

#### 3.3.1 Authentication and Privilege Escalation Prevention

siegeNgin assumes operation on authenticated pages and implements the following multi-layered authentication architecture:

- **OTP two-factor authentication**: Requires one-time password authentication at login. Maintains 100% success rate for authentication in multi-PC environments.
- **Session token management**: Session tokens issued after authentication have a 24-hour TTL (Time To Live) and automatically expire. This eliminates risks from unlimited session persistence.
- **5-failure lockout**: Automatically locks out accounts after 5 consecutive failed OTP authentication attempts. When lockout occurs, Telegram notifications are immediately sent, allowing account owners to detect unauthorized access attempts.
- **response.json authentication control**: In responses from server to client (response.json), actions (operation instructions) are stripped when authentication is not confirmed. This structurally makes it impossible to bypass authentication and execute AI operations.

#### 3.3.2 Operation Confirmation and Error Recovery

siegeNgin has multi-stage confirmation mechanisms to ensure operation safety:

- **Confirmation dialogs (all actions)**: Displays confirmation dialogs to users before execution for all actions generated by AI. Users can review the content of each action and choose to approve or reject.
- **Double confirmation (submit operations)**: For form submissions and other difficult-to-cancel operations, double confirmation is required in addition to regular confirmation dialogs. Additional confirmation "Are you sure you want to submit?" prevents unintended submits.
- **Git rollback**: All operations are under Git version control, enabling immediate rollback to any point with `git reset --hard`. This ensures reliable recovery to previous states when AI misinterpretation or unintended operation results occur.

#### 3.3.3 XSS Countermeasures

The following countermeasures are implemented against XSS (Cross-Site Scripting) risks when Chrome extensions extract DOM element information:

- **DOM API + textContent method**: When retrieving innerHTML, instead of directly processing raw HTML strings, we use structural access through DOM API combined with text extraction via textContent. This method was implemented as a fix for vulnerabilities identified in security audits (P1: Critical).
- **DOMPurify application**: At points where user input or AI-generated content is inserted into the DOM, sanitization using the DOMPurify library is applied to prevent script injection.

#### 3.3.4 Privacy Protection

siegeNgin's architecture is based on privacy-by-design principles:

- **localhost-complete architecture**: The siegeNgin server operates on localhost, and operation data is not sent to external servers. All user operation history, DOM information, and natural language instructions are processed and stored within the local environment.
- **latest.json overwrite method**: The latest.json file used for communication with AI adopts an overwrite method that retains only the latest item, structurally eliminating risks of operation history accumulation and external leakage.
- **Local Git repository**: Git version control operates as a local repository, and data is not transferred outside the EC2 instance unless explicit push operations are performed.

#### 3.3.5 Security Audit Results

siegeNgin underwent independent security auditing, completing immediate fixes for all 10 identified vulnerabilities (P1: Critical 1, P2: High 3, P3: Medium 4, P4: Low 2) and obtaining a clean report in re-audit. The fact that this "audit → fix → re-audit" cycle was completed in one day also demonstrates the responsiveness of the symbol emergence development process (see 3.3.5).

## 4. Analysis from Symbol Emergence Systems Theory

### 4.1 Symbol Grounding as Pointing Acts

The pointing act in siegeNgin realizes a four-stage process (perceptual → embodied → conceptual → operational grounding) that grounds abstract HTML/DOM structures as concrete operational objects, transforming symbol grounding dependent on conventional technical knowledge into symbol grounding based on direct visual-action coupling.

#### 4.1.1 Hybrid Embodiment: Theorizing Dual Body Structure

The symbol grounding that siegeNgin realizes is based on a new body concept that is essentially different from the single-body model in conventional robotics. We theorize this as **Hybrid Embodiment**.

Hybrid Embodiment in siegeNgin consists of the following dual body structure:

**Human body**: Responsible for pointing acts (mouse clicks, gaze, intention). This body provides direct coupling of perception-action, realizing the most primordial symbol grounding act of "pointing at what is seen."

**AI's computational body**: Responsible for DOM manipulation capabilities (element selection, attribute changes, style application). This body enables concrete operation execution in digital environments, converting human intentions into technical implementations.

Through this dual body structure, humans and AI function as one **extended body system** beyond mere "collaboration." The human perceptual body and AI operational body are complementarily coupled, creating new forms of embodiment in digital environments.

In conventional robotics, it was presupposed that one agent maintains consistent bodily unity from perception to operation. However, in Hybrid Embodiment, by distributing bodily functions between humans and AI, more flexible and efficient environmental adaptation becomes possible. This is a fundamental extension of the body concept in symbol emergence theory. This dismantles the premise "embodiment = physical body" and redefines the body as "an executive system that acts prediction errors on the environment." Through this redefinition, the role of the body in CPC becomes a general framework that is not limited to physical robotics but also encompasses the operational capabilities of computational agents.

### 4.2 Symbol Emergence Process Between Humans and AI

In the siegeNgin system, humans and AI participate collaboratively in the symbol emergence process. To understand this process, a fundamental redefinition of the concept of symbols is first necessary.

#### 4.2.1 Relational Redefinition of Symbols

Symbols are redefined from "internal representations" to "relational attractors within coupled generative systems." The operational vocabulary of siegeNgin exists not within individual agents but as stable points of the human-AI coupled system, demonstrating the extension of Taniguchi's theory to human-LLM coupled systems.

#### 4.2.2 Distributed Meaning Generation

Based on this relational understanding of symbols, distributed meaning generation is described as follows: When contextual information provided by humans (pointing position, natural language instructions) couples with AI's analytical capabilities (DOM structure understanding, operation reasoning), new stable points—that is, new symbols—emerge that did not exist in advance within either generative model.

#### 4.2.3 Human-AI Collaboration Dynamics as CPC

Based on the CPC framework defined in section 2.7, symbol emergence between humans and AI in siegeNgin can be described as the following three-stage process:

**Stage 1: Reference Determination** - Pointing realizes constraint of latent variable z, dramatically reducing prediction error variance. Formally, pointing can be described as an operation that rapidly decreases the entropy of the posterior distribution p(z|x,point) of latent variable z, having the effect of unimodally constraining the multimodal posterior distribution in the case of language instruction only.

**Stage 2: Intention Update** - AI's generative model is updated through natural language instructions, and confirmation dialogs function as error feedback loops.

**Stage 3: Shared Vocabulary Formation** - Through sessions, operational vocabulary such as "get this" and "delete here" emerges as shared latent categories.

### 4.3 Theoretical Positioning of siegeNgin from the CPC Perspective

Based on the CPC framework defined in section 2.7, siegeNgin presents a new form of CPC realization in the triadic structure of "human × LLM × DOM."

DOM's character as a "semi-grounded environment"—possessing both the perceivability of the physical world and the operability of symbol space—enables simultaneous identification of visual objects and symbolic descriptions through the single act of pointing. This brings about dramatic convergence acceleration compared to the gradual symbol grounding of CPC in physical environments.

### 4.4 Decentralization of Symbol Emergence

siegeNgin deconstructs conventional web development that depended on technical authority (developers, CMS, specialized terminology) through an intuitive interface of "point at what you see and say it in Japanese," realizing the decentralization of symbol emergence. In the CPC framework, this can be described as a transition from centralized prediction error minimization by authoritative agents to distributed meaning generation in which end users directly participate.

### 4.5 Clarification of Theoretical Contributions

The theoretical contributions of this study are organized as follows:
1. Extension of CPC theory's application domain: Theoretical bridge from robotics to human-LLM collaboration
2. Redefinition of pointing: Theoretical positioning as "prediction error compression channel"
3. Generalization of symbol grounding concept: Extension from physical grounding to "coupling with external structures that constrain prediction errors"
4. Extension of body concept: Proposal of dual body model through Hybrid Embodiment
5. Decentralization of symbol emergence: Implementation demonstration of Decentralized Semiotic Alignment

### 4.6 Technical Limitations and Challenges

On the other hand, siegeNgin also has the following technical and theoretical challenges:

#### 4.6.1 Contextual Ambiguity

Instructions in natural language have high context dependency, and there is potential for divergence between AI interpretation and human intention.

#### 4.6.2 Limitations of Complex Operations

Addressing complex operational procedures that are difficult to express through single pointing + natural language instructions.

#### 4.6.3 Security Trade-offs

Balancing convenience improvement and security assurance.

#### 4.6.4 CPC Convergence Bias

There is a risk that the CPC process converges to local optimal solutions, overlooking diverse operational possibilities. It is necessary to consider the possibility that CPC between humans and AI becomes fixed on specific patterns, hindering the discovery of creative operational methods.

### 4.7 Empirical Cases of Emergent Nonlinear Convergence

The "emergent nonlinear convergence" theoretically discussed in 4.2.3 has been actually observed in the development processes of siegeNgin and its surrounding products. Below we report specific cases where symbol emergence through human-AI collaboration transitioned from quantitative change to qualitative change.

**Case 1: medical_open_data (MODS)—32-minute PoC completion**

A Proof of Concept (PoC) for a medical facility search system integrating Ministry of Health, Labour and Welfare open data was completed in 32 minutes through human-AI collaboration. In conventional software development processes, this scale of system would require days to weeks for requirements definition → design → implementation → testing. This explosive development speed is the result of fusion between human intention to "melt walls" and AI's technical implementation capabilities, which cannot be explained by the sum of individual work times. That is, the collaborative process itself generated emergent acceleration effects.

From the CPC perspective, this 32-minute development speed can be interpreted as a case where predictive models between humans and AI converged in extremely short time. The developer's intention ("I want to make open data searchable") and AI's technical model ("API endpoint design, data transformation, frontend construction") rapidly minimized prediction errors through the efficient channel of pointing + natural language.

**Case 2: BDD (Bonno-Driven Development)—midnight symbol emergence explosion**

There was a case where the entire process of XPathGenie feature development → paper writing → review → demonstration was completed in 3 hours at midnight. Behind this compression of what would normally take months in academic processes is a development methodology called "Bonno-Driven Development" (BDD). This is a phenomenon where intellectual curiosity (bonno) toward technical challenges becomes an energy source, and the symbol emergence process through human-AI collaboration self-accelerates. This phenomenon, qualitatively different from conventional planned development processes, can be positioned as a typical example of steep error reduction phases in symbol emergence—that is, moments when quantitative accumulation exceeds a threshold to cause qualitative change.

**Case 3: siegeNgin Security Audit—1-day completion cycle**

In security auditing (see section 3.3.5), an independent auditor (Mefi) identified 10 vulnerabilities, the developer fixed all of them on the same day, and the cycle of obtaining a clean report in re-audit was completed in one day. This process can be analyzed as symbol emergence between the auditor and developer (both human-AI collaborative entities). The cycle of vulnerability identification (symbol generation) → fix (symbol interpretation and response) → re-audit (new symbol generation) rotated at a speed unthinkable in normal development processes.

Common to these cases is the phenomenon that symbol emergence in human-AI collaboration accelerates nonlinearly when it exceeds a certain threshold. This is structurally homologous to nonlinear convergence in physics—like water suddenly boiling at 100°C—and can be positioned as empirical evidence of "steep error reduction phases" in symbol emergence systems.

### 4.8 Open Source Knowledge Emergence

siegeNgin's Git management function has the potential to function as a foundation for collective intelligence emergence beyond mere version control. Knowledge such as operation history, optimization patterns, and error response strategies accumulates and is shared across the entire community, enabling distributed knowledge emergence similar to Wikipedia and OSS projects.

## 5. Discussion

### 5.1 Evolutionary Positioning of Symbol Emergence in Digital Environments

To properly understand siegeNgin, it is necessary to position digital environments as new developmental stages of symbol emergence from a cultural evolutionary perspective. Human symbol emergence processes can be understood as the following continuous evolutionary series:

**Physical grounding** (~100,000 years ago) → **Language** (50,000-100,000 years ago) → **Writing** (5,000 years ago) → **Recording media** (500 years ago) → **Computers** (50 years ago) → **LLM** (present)

At each stage, the medium and possibilities of symbol emergence have been qualitatively expanded. Symbol emergence that began with physical gestures transcended time and space through spoken language, acquired permanence through writing, enabled mass reproduction through printing, realized automatic processing through computers, and was condensed as statistical structures of human linguistic activity through large-scale language models.

**The essence of LLMs is artificial systems in which human collective linguistic activity is condensed as statistical structures**—externally instantiated generative models distilled from large-scale human linguistic interaction. LLMs are not simple imitations of human language capabilities but crystallizations of collective intelligence extracted from billions of people's linguistic practices.

siegeNgin is positioned as a **minimal prototype** that enables coexistence of this external generative model with humans in the same digital environment. In the semi-grounded space of the DOM environment, human bodily intuition (pointing) and externalized linguistic intelligence (LLM) are directly coupled, realizing new forms of symbol emergence.

### 5.2 Realization of Direct Manipulation through Affordance Design

In this cultural evolutionary context, siegeNgin's design philosophy is deeply related to Gibson's affordance theory. Each DOM element on web pages has potential operability (affordances), but in conventional web development, these affordances were only accessible through technical knowledge.

siegeNgin enables direct perception of the following affordances through its pointing interface:
- Visual recognition of "clickability"
- Contextual understanding of "editability"
- Semantic grasp of "relatedness"

### 5.3 Web Operation as Language Games

From the perspective of Wittgenstein's language game theory, siegeNgin creates a new kind of "language game." In this game:

- **Players**: Humans, AI, web pages
- **Rules**: Instructions through pointing + natural language
- **Context**: The state of specific web pages
- **Goal**: Execution of intended operations

The characteristic of this language game is that, unlike conventional programming language games, it does not depend on formal syntax but consists of combinations of natural language and direct manipulation.

### 5.4 Micro-development within Collaborative Episodes

From the perspectives of developmental psychology and learning sciences, siegeNgin sessions are redefined as **micro-development within collaborative episodes**. While conventional developmental research has focused on long-term cognitive changes, siegeNgin observes rapid meaning development within single sessions.

#### 5.4.1 Three-stage Development Process

The typical development process in siegeNgin sessions goes through the following stages:

**Initial stage: Reference ambiguity period**
- User instructions are abstract, causing variation in AI interpretation
- Ambiguous references like "change here" and "fix that" are frequently used
- Operation success rate is low, with many confirmation dialogs occurring

**Middle stage: Shared vocabulary formation period**
- Session-specific operational vocabulary is formed through pointing + natural language
- Stable reference expressions like "this heading part" and "right navigation" are established
- AI operation proposal accuracy improves, and user approval rate increases

**Late stage: Compressed operational expression period**
- Highly compressed instructions like "the usual thing" and "that process" become possible
- Dependence on context increases, establishing "insider language" difficult for external observers to understand
- Operation efficiency is maximized, and complex tasks are executed with concise instructions

#### 5.4.2 DOM's Developmental Scaffolding Function

Connecting with Vygotsky's Zone of Proximal Development (ZPD) concept, the DOM environment functions as **developmental scaffolding** in human-AI collaboration.

Users realize complex web operations that would be difficult to execute alone through collaboration with AI as a "more competent other." What's important is that this collaboration is gradually internalized, and users' operational capabilities actually improve. Through repeated sessions, users:
- Deepen intuitive understanding of web structures
- Learn how to give effective instructions
- Develop bodily skills in digital environments

The external scaffolding of DOM structure supports the development of internal operational capabilities, ultimately enabling certain levels of operation even without the scaffolding—this is the essence of micro-development in siegeNgin.

#### 5.4.3 Key Phrase for ICDL

"**Pointing acts as a developmental compression channel that accelerates shared symbol emergence**"

The one-time determination of reference through pointing dramatically accelerates the symbol emergence process, enabling rapid development within sessions.

### 5.5 Threshold Effects in Symbol Emergence

If the siegeNgin system becomes widely adopted, "steep error reduction phases" of symbol emergence may occur. Specifically:

1. **Standardization of operation patterns**: Common operations become symbolized
2. **Emergence of new meaning systems**: Appearance of new vocabulary and concepts specialized for web operations
3. **Formation of collective intelligence**: Community-wide sharing of optimal operation methods

### 5.6 Social Impact

The "decentralization of symbol emergence" that siegeNgin realizes may bring about the following social changes:

1. **Bridging the digital divide**: Elimination of need for technical expertise
2. **Liberation of creativity**: Promotion of creative activities through liberation from technical constraints
3. **Changes in authority structures**: Transition from technical authority to collaborative emergence
4. **New forms of labor**: Creation of new occupations through human-AI collaboration

### 5.7 Attempts at Quantitative Evaluation

Direct quantification of symbol emergence processes is fundamentally difficult. As discussed in 1.1, the moment we attempt to measure symbol emergence with existing symbol systems, the essence of emergence—the unpredictable appearance of new meaning—is impaired. This is a theoretical limitation that should be stated as epistemological honesty.

However, the difficulty of directly quantifying symbol emergence processes does not mean we cannot measure the quality of **products** that symbol emergence creates. Symbol emergence is a "process," and the "results" that this process generates can be evaluated with ordinary engineering indicators. Below we report quantitative evaluation data from the siegeNgin ecosystem.

#### 5.7.1 XPathGenie: Precision of Structural Symbol Grounding

XPathGenie is an LLM-driven system that converts human natural language element specifications into XPath queries, ensuring the precision of symbol grounding as a preliminary stage of siegeNgin. In evaluation targeting 23 websites:

- **Hit Rate (element discovery rate)**: 87.3% (average across 23 sites)
- **Semantic Accuracy**: 95.0% (manual verification of 100 cases, evaluating whether extracted elements have intended semantic content)

The Hit Rate not reaching 100% is due to structural limitations of XPath, such as dynamic rendering and Shadow DOM. Meanwhile, the Semantic Accuracy of 95.0% shows that symbol grounding—the correspondence between natural language intentions and DOM elements—is realized with high precision.

#### 5.7.2 siegeNgin Google Sheets Integration: Bidirectional Symbol Transcription

In evaluating the Google Sheets integration function of siegeNgin, we assessed bidirectional transcription of 18 fields (web form → Sheets, Sheets → web form):

- **Transcription success rate**: 18/18 fields (100%)
- **Bidirectionality**: Confirmed complete bidirectional transcription

This 100% figure is direct evidence that siegeNgin's symbol grounding mechanism—DOM element identification through pointing → meaning attribution through natural language → operation execution by AI—functions with practical precision.

#### 5.7.3 OTP Authentication: Security Symbol Grounding

Authentication system evaluation:

- **Multi-PC authentication success rate**: 100%
- **5-failure lockout operation confirmation**: Normal operation (Telegram notification after lockout also confirmed)

The 100% operation of security functions means that the symbol "trust" is accurately grounded in technical mechanisms.

#### 5.7.4 Position Statement on Quantification

These figures are not measurements of symbol emergence processes themselves, but quality measurements of products generated by symbol emergence processes. Just as we can measure the temperature at which water boils (100°C) but cannot completely describe the individual movements of water molecules, the outcomes of symbol emergence are measurable, but complete quantification of the emergence process is fundamentally impossible.

This study takes a dual methodological position of "measuring what can be measured and theoretically discussing what cannot be measured" while clearly stating this epistemological limitation.

### 5.8 Comparative Analysis with Existing Systems

To clarify the positioning of siegeNgin from the perspective of symbol emergence systems theory, we conduct comparative analysis with existing similar system groups. We set four comparison axes: ①presence of symbol grounding, ②embodiment (relationship with users' bodily acts), ③authority dependence, and ④emergence.

#### 5.8.1 CMS (WordPress, Wix, Squarespace, etc.)

Conventional CMS operates web content through mediation layers called management screens.

- **Symbol grounding**: Indirect. The correspondence between form fields on management screens and displays on web pages is determined by the system. Users input into "title" fields, but what web page elements this corresponds to depends on CMS templates. The relationship between symbols (input) and real world (display) is not directly constructed by users but mediated by platforms.
- **Embodiment**: Low. Input operations on management screens lack visual and spatial correspondence with final displays.
- **Authority dependence**: High. CMS platform specifications determine the upper limits of operational possibilities. Expression is limited to what templates allow.
- **Emergence**: Limited. Expression is limited to within the design intentions of platforms.

#### 5.8.2 Browser Automation Tools (Selenium, Puppeteer, Playwright, etc.)

Programmatic browser operation tools automate DOM manipulation, but all operations are described as code.

- **Symbol grounding**: Formal. DOM element specification through CSS selectors or XPath is symbolically accurate but lacks direct correspondence with human perceptual experience ("what is seen"). The symbol `document.querySelector('.header > h1')` refers to the same object as the "large heading text" that humans see on web pages, but the grounding relationship between the two depends on programmer expertise.
- **Embodiment**: None. All operations are described as code, with no involvement of user bodily acts.
- **Authority dependence**: Extremely high. Programming language acquisition is prerequisite, and DOM structure understanding is essential. Dependence on technical authority is strongest.
- **Emergence**: Technically high (arbitrary operations can be described) but low in terms of symbol emergence (only operations predetermined as code are executed).

#### 5.8.3 RPA (UiPath, Automation Anywhere, Power Automate, etc.)

RPA is an approach where software robots mimic and automate human repetitive operations.

- **Symbol grounding**: Superficial. Based on recognition of UI elements on screens but depends on "position" or "appearance" rather than "meaning" of elements. Easily breaks with screen layout changes.
- **Embodiment**: Mimetic. In the form of recording and replaying human operations, it is merely formal mimicry of human bodily acts.
- **Authority dependence**: Moderate. Specialized programming is unnecessary, but learning workflow design tools is required.
- **Emergence**: Low. Repetitive execution of predefined workflows; no emergence of new meaning occurs. RPA is "automation," not "emergence."

#### 5.8.4 AI Coding Assistants (GitHub Copilot, Cursor, etc.)

AI coding assistants realize collaboration with AI in code generation, but their interactions are closed within code symbol systems.

- **Symbol grounding**: Limited to code symbol systems. They generate code from natural language prompts, but programmers must verify the correspondence between generated code and final web display.
- **Embodiment**: Low. Text input is the primary interaction means.
- **Authority dependence**: Medium to high. While code generation can be instructed in natural language, programming knowledge is necessary to evaluate generated results.
- **Emergence**: Partially high. Unexpected code suggestions by AI can sometimes trigger new ideas. However, this emergence is limited to within code symbol systems and does not directly connect with end users' meaning worlds.

#### 5.8.5 Comprehensive Comparison

The uniqueness of siegeNgin lies in being irreducible to any of the above categories:

| Comparison Axis | CMS | Browser Automation | RPA | AI Coding | **siegeNgin** |
|-----------------|-----|-------------------|-----|-----------|---------------|
| Symbol Grounding | Indirect | Formal | Superficial | Code-internal | **Direct** |
| Embodiment | Low | None | Mimetic | Low | **High** |
| Authority Dependence | High | Extremely High | Medium | Medium-High | **Low** |
| Emergence | Limited | Low | Low | Partial | **High** |

siegeNgin is the only system with advantages across all four axes: "direct symbol grounding," "high embodiment," "low authority dependence," and "high emergence." This shows that siegeNgin simultaneously solves the structural limitations of existing system groups—indirect symbol grounding, lack of embodiment, dependence on authority, lack of emergence—through hybrid interaction of pointing + natural language.

### 5.9 Ontology of Meaning: Symbol Emergence as Relational Generation

Symbol emergence systems theory overturns the substantialist view of meaning in Western metaphysics—understanding meaning as mental representations or referential objects—and redefines meaning as "events that dynamically occur within relationality."

Meaning in siegeNgin does not inhere in DOM elements, users, or AI, but occurs within the relationality among the three. This structurally corresponds to Buddhist dependent origination—interdependent arising without substance—and Deleuzian difference theory—productive difference preceding identity, showing that meaning in symbol emergence has relational, event-like, emergent, and context-dependent characteristics.

### 5.10 Theoretical Appropriation and Limitations of Buddhist Concepts

The Buddhist concepts appropriated in this paper (self-reliance and dharma-reliance, dependent origination, emptiness) are adopted as epistemological attitudes, not religious doctrines. These are structurally cognate with Western pragmatism—James's radical empiricism, Dewey's instrumentalism, Peirce's dynamic semiotics—and can be understood as expressions of epistemological attitudes shared across multiple philosophical traditions.

However, limitations are also clarified. Buddhist dependent origination is originally positioned in practical liberation contexts, and this paper's epistemological appropriation is a kind of decontextualization. Moreover, the universality of Buddhist concepts is a question requiring empirical verification, and this paper limits itself to the claim that they are "effective as theoretical resources for symbol emergence systems theory."

### 5.11 siegeNgin is an Implementation of the CPC Hypothesis

This section shows that siegeNgin's design corresponds one-to-one with the structure of the CPC hypothesis, and further considers the theoretical implications of the fact that this correspondence was established unconsciously.

#### 5.11.1 Structural Correspondence

The structural correspondence between the CPC hypothesis defined in section 2.7 and siegeNgin is as follows: Human users (agent i) and Gemini AI (agent j) exchange prediction errors through hybrid channels of pointing + natural language, leading to the emergence of shared operational vocabulary (latent variable z). This structural isomorphism shows direct implementation of CPC dynamics—distributed predictive model mutual adjustment leading to shared symbol emergence.

#### 5.11.2 The Fact of Unconscious Implementation and Its Implications

Here we report an extremely important fact.

The developer of siegeNgin (FLOW) knew symbol emergence systems theory in advance. He had read Tadahiro Taniguchi's "Word Map: Symbol Emergence Systems Theory: Mechanism Analysis of Language and Culture" [26] in April 2025 and had direct exchanges with Professor Taniguchi on X (formerly Twitter). He also understood the basic content of the CPC hypothesis—collective extension of predictive coding, symbol emergence through predictive model adjustment among multiple agents.

**Nevertheless, during siegeNgin development, the developer did not realize he was implementing CPC.**

The initial commit of siegeNgin was at 2026-02-20 05:55 (JST). Development proceeded in BDD (Bonno-Driven Development) mode at high speed through pointing function implementation → natural language processing integration → AI operation generation → security implementation. During this process, the developer adopted the design of "resolving references through pointing," "conveying intentions through natural language," "AI predicting and proposing operations," and "users providing feedback through approval/rejection" not as deduction from the CPC hypothesis, but **as a consequence of practical problem-solving**.

Then, about 6 hours after the initial commit, the developer left the commit message "pointing as symbol grounding." At this moment, two parallel thought processes in the developer's mind—"developing siegeNgin as a practical tool" and "knowledge of symbol emergence systems theory as a theoretical framework"—were linguistically connected for the first time.

#### 5.11.3 Interpretation from Cognitive Characteristics (Based on Developer Self-Report)

This phenomenon of "knowing but not realizing" is closely related to the developer's cognitive characteristics. According to the developer's self-reported WAIS-IV intelligence test profile, there is a significant difference between Processing Speed Index (PRI: 130) and Verbal Comprehension Index (VCI: 108).

A PRI of 130 (top 2%) means extremely high processing capability in visual pattern recognition, nonverbal reasoning, and spatial manipulation. This corresponds to "GPU brain"—the ability to perform massive parallel processing at high speed. During siegeNgin design, this GPU brain was parallel-processing the theoretical knowledge of symbol emergence systems theory and the implementation challenges at hand **at a nonverbal level**. The design decision to "resolve references through pointing" was structurally isomorphic to "optimization of communication channels that minimize prediction errors" in CPC, but this isomorphism was operating at the level of nonverbal intuition.

On the other hand, a VCI of 108 (average to slightly high) suggests that the process of verbalizing the results of this nonverbal parallel processing—that is, explicitly recognizing "this is an implementation of CPC"—**delays** relative to nonverbal processing. Indeed, this linguistic connection occurred 6 hours after development began, and during that time, the developer "knew" CPC but could not "articulate" it.

This is a concrete example of the conversion process from tacit knowledge to explicit knowledge (Polanyi), and is also a phenomenon within the scope of symbol emergence systems theory itself. Theoretical knowledge can guide practice without explicit linguistic reference—this is consistent with the hierarchical structure of predictive coding mentioned in 2.7.1, where symbol grounding occurs first at embodied and practical levels, with linguistic-level grounding following later.

#### 5.11.4 New Form of External Validity of Theory

This fact demonstrates the external validity of the CPC hypothesis in a new form.

Conventional methods of demonstrating a theory's external validity are ①experimental verification (hypothesis testing under controlled conditions), ②survey verification (data collection through field surveys), and ③comparative studies (confirming the applicability of theories in different contexts). However, the siegeNgin case shows a fourth method—**convergent independent implementation**.

That is: A practitioner who "knew" the theory independently implemented the structure described by that theory in the process of practical problem-solving without consciously referring to the theory. This fact serves as circumstantial evidence that the structure described by the CPC hypothesis is not an "artificial theoretical construct" but **something so essential that it naturally emerges within human cognitive processes**.

If "a practitioner who did not know the theory accidentally implemented CPC," this could be dismissed as "coincidental agreement." However, the fact that "a practitioner who knew the theory implemented CPC without consciously using that theory" has stronger implications. The theoretical knowledge existed within the developer's cognitive space but influenced practice through nonverbal pattern recognition (PRI) rather than linguistic reference (VCI). This shows that the CPC hypothesis functions not as "rules to be linguistically referenced" but as "structures inherent in cognitive processes."

The unconscious emergence of theory within practice—is this not the strongest form of evidence that the theory accurately captures the deep structures of human cognition? Just as children can throw balls accurately without knowing Newtonian mechanics, the fact that a developer can implement CPC without linguistically being conscious of CPC suggests that the "collective minimization of prediction errors leading to symbol emergence" described by CPC is a natural mode of human cognition and collaboration.

#### 5.11.5 siegeNgin as Self-Verification of Symbol Emergence Systems Theory

Integrating the above analysis, siegeNgin can be positioned as a "self-verification system" of symbol emergence systems theory.

1. Symbol emergence systems theory theorizes "how symbols emerge"
2. siegeNgin is a system that realizes symbol emergence between humans and AI
3. siegeNgin itself was born through symbol emergence between humans and AI (BDD)
4. siegeNgin's design is structurally isomorphic with the CPC hypothesis
5. This isomorphism was established unconsciously—in the form of theory naturally emerging within practice

This five-fold recursive structure is a practical development of the "recursivity of discussing symbol emergence with symbols" mentioned in 1.1, and is the most concrete evidence that symbol emergence systems theory has the character of "theory that verifies itself"—self-referential theory.

## 6. Chain of Symbol Emergence: MODS→XPathGenie→siegeNgin

siegeNgin is not an isolated tool. It is positioned within a series of product groups born from the same development team (bon-soleil DevTeam). These products function as symbol emergence systems that each dissolve different "walls" and form mutual synergies.

### 6.1 MODS (Medical Open Data Search): Dissolving Data Walls

A system that integrates and API-izes Ministry of Health, Labour and Welfare open data, making 420,000 medical facilities searchable. It grounded closed government data as "symbol systems" through open API interfaces. This realized data symbol grounding—abstract administrative data gaining meaning as concrete "neighborhood hospitals."

### 6.2 XPathGenie: Dissolving Web Structure Walls

An LLM-driven automatic XPath generation system that makes the specialized work of HTML structure analysis executable in natural language. It achieved 95.0% semantic accuracy in 23-site evaluation. This is an attempt to ground web structural symbols (DOM, XPath) with human meaning understanding and is indispensable symbol grounding technology as a preliminary stage of siegeNgin.

### 6.3 Positive Feedback Loop

These three systems form a positive feedback loop of symbol emergence:

1. **MODS** dissolves data walls and liberates information
2. **XPathGenie** dissolves web structure walls and grounds structural meaning
3. **siegeNgin** dissolves operation walls and directly grounds human intentions to the web via AI
4. These tools themselves were born through **human × AI symbol emergence**—that is, symbol emergence processes generate symbol emergence tools, and those tools accelerate further symbol emergence

This chain structure is a practical case of "recursive structure" in symbol emergence systems theory. Just as symbol emergence systems theory itself is described with symbols, symbol emergence tools are also born through symbol emergence.

### 6.4 Ideological Background of "Dissolving Walls"

The developer positions these product groups as acts of "dissolving walls" [11]. Walls of technology, regions, education, language—all walls can be interpreted as disconnections between symbol systems. The naming of siegeNgin as "siege engine" is precisely a metaphor for physically breaking through these walls (castle walls).

From the perspective of symbol emergence systems theory, "walls" are non-connections between symbol systems, and "dissolving walls" is nothing other than establishing interaction channels between different symbol systems and enabling new symbol emergence.

## 7. Service Vision: Decentralized Symbol Emergence Platform

Based on theoretical analysis, we present a vision for services centered on siegeNgin.

### 7.1 Architecture

- **Hosting**: GitHub Pages ($0, static HTML, zero attack surface)
- **Server**: Minimal EC2 configuration with siegeNgin server + Git repository
- **Frontend**: Chrome extension (siegeNgin)
- **AI**: Gemini (BYOK: Bring Your Own Key)
- **Chatbot**: ChatBot Lite + RAG (knowledge base for entire site)
- **Version control**: Git (recovery with `reset --hard`)

### 7.2 Comparison with CMS: Transformation of Authority Structures

Conventional CMS has centralized authority structures. In systems like WordPress, platform specifications (authority) determine operational possibilities, and users are only allowed meaning generation within those frameworks.

In siegeNgin-based services:
- No need for management screens as "authority"
- Users directly attribute meaning to web pages
- Recovery through Git even if broken (no dependence on authoritative systems)
- Meaning emerges through democratic processes of dialogue with AI

This is an implementation of "direct understanding without authority" shown by symbol emergence systems theory.

### 7.3 Web3 Development: Symbol Grounding as Trust Layer

In an era when quantum computing becomes practical, proof of "what is authentic"—trust—becomes an important factor. In an age when AI can generate anything, blockchain functions as a trust layer.

siegeNgin has a vision of enabling non-engineers to execute NFT metadata generation → contract deployment → minting in natural language. This involves:
- What humans do: Fire (Bizen pottery), shoot (photos/3D), say "I want to make this an NFT"
- What AI does: Metadata generation, deployment, minting, website updates

From a symbol emergence perspective, physical objects (Bizen pottery) are grounded as digital symbols (NFTs), and blockchain guarantees symbol grounding of authenticity.

## 8. Conclusion

This paper analyzed siegeNgin from the perspective of symbol emergence systems theory and clarified its innovation and social significance. The "pointing act" in siegeNgin functions not as a mere input method but as a practical solution to the symbol grounding problem, enabling new symbol emergence processes between humans and AI.

### 8.1 Clarification of Theoretical Contributions

The essential significance of siegeNgin lies in being not merely a "tool" but a **minimal prototype of human-external generative model coupled systems**. While conventional web tools were instrumental beings that assisted human work, siegeNgin realizes new modes of existence where humans and LLMs (externalized linguistic intelligence) function as one extended cognitive system.

The theoretical contribution of this study lies in developing symbol emergence theory from "embodiment robotics-centered theory" to "extended theory encompassing human-LLM collaboration." Specifically:

1. **Extension of grounding concept**: From sensorimotor coupling with physical environments to coupling with external structures that constrain prediction errors
2. **Theorization of Hybrid Embodiment**: Dual body structure of human perceptual body and AI operational body
3. **Relational redefinition of symbols**: From internal representations to relational attractors within coupled systems
4. **Cultural evolutionary positioning of digital environments**: Understanding LLMs as statistical condensation of human collective linguistic activity
5. **Proposition of Micro-development framework**: Developmental understanding of rapid symbol emergence processes within sessions

Particularly important is the "deconstruction of technical authority" and "decentralization of symbol emergence" that this system realizes. While conventional web development involved meaning generation dependent on the authority of technical expertise, siegeNgin realizes symbol emergence processes accessible to anyone through intuitive pointing + natural language interfaces.

From the perspective of the CPC hypothesis newly introduced and expanded in the R6 revision, it was shown that symbol emergence between humans and AI realized by siegeNgin can be precisely described as "emergence of shared symbols through mutual adjustment of distributed predictive models." Particularly, the three-stage process presented in 4.2.3 (reference determination → intention update → shared vocabulary formation) is a concrete implementation of CPC dynamics. We also clarified that DOM's character as a "semi-grounded environment" theoretically explains high-speed convergence impossible in conventional CPC.

Furthermore, the fact that siegeNgin's design is structurally isomorphic with the CPC hypothesis, and that this isomorphism was established as unconscious implementation by the developer, demonstrates the external validity of the CPC hypothesis in the new form of "convergent independent implementation." This is powerful evidence that the structure described by CPC is something essential that naturally emerges within human cognitive processes.

Such technological innovation not only improves convenience but presents new paradigms of human-AI collaboration. This is a higher-order human-AI relationship that involves AI not as a mere tool but as an equal collaborative partner in symbol emergence processes.

**Pointing acts as a developmental compression channel that accelerates shared symbol emergence**—this proposition succinctly expresses the developmental psychological significance of siegeNgin. Pointing acts dramatically accelerate symbol emergence processes that would proceed only gradually through conventional linguistic communication, enabling rapid cognitive development within sessions.

Note that this system siegeNgin completed implementation, theorization, and multifaceted review in 20 hours from development start, and is less than one day in operation at the time of writing. This development speed itself can be interpreted as a case of rapid prediction error convergence in CPC discussed in section 4.2.3. The history of the developer designing siegeNgin without explicitly referring to symbol emergence theory and discovering structural correspondence with the CPC hypothesis post hoc (section 5.11) serves as independent evidence of the theory's external validity. In the future, we plan empirical verification of theoretical hypotheses raised in this paper—particularly shared vocabulary emergence in micro-developmental processes and prediction error convergence—through longitudinal user studies in actual website operation support.

### 8.2 Future Research Challenges

Future research challenges include:

1. **Development of quantitative measurement methods for symbol emergence processes**: Further refining the "product quality measurement" approach presented in 5.7 to establish indirect quantification methods for symbol emergence processes
2. **Observation of steep error reduction phases during large-scale deployment**: Large-scale reproduction of small-scale cases reported in 4.7 to identify conditions for nonlinear convergence
3. **Exploration of optimal balance points between security and convenience**: Long-term operational data verification of security architecture effectiveness detailed in 3.3
4. **Extension of symbol emergence decentralization methods to other domains**: Exploring deployment possibilities in areas other than web operations (medical information systems, educational platforms, etc.)
5. **Empirical verification through user studies**: Detailed in 8.3 below
6. **Quantitative tracking of prediction errors based on CPC hypothesis**: Quantitatively measuring prediction error transitions in human-AI interactions within sessions to empirically verify CPC convergence dynamics

### 8.3 User Study Design Proposal

A major limitation of this paper is the lack of empirical verification through user studies. Empirical research using standard evaluation methods in the HCI field is essential for empirically supporting the theoretical claims of this paper. Below we present a design proposal for user studies to be conducted in the future.

#### 8.3.1 Research Objectives

To verify whether siegeNgin's pointing + natural language hybrid interaction has advantages over conventional web development methods in terms of (1) task completion rate, (2) subjective usability, and (3) cognitive load.

#### 8.3.2 Participant Conditions

- **Group 1 (Non-technical group)**: No programming experience, daily web browsing experience. N ≥ 15
- **Group 2 (Beginning technical group)**: Basic HTML/CSS knowledge, beginner JavaScript. N ≥ 15
- **Group 3 (Advanced technical group)**: 2+ years practical experience in web frontend development. N ≥ 15
- **Age**: 20-60 years (including both digital natives and non-natives)
- **Exclusion criteria**: Prior siegeNgin usage experience

#### 8.3.3 Task Design

Conduct the following three types of tasks for each group:

- **Task A (Simple operations)**: Text color changes, font size changes, image replacements on web pages
- **Task B (Moderate operations)**: Navigation menu item additions, form field rearrangement, responsive design verification
- **Task C (Complex operations)**: Bulk style changes across multiple pages, dynamic element additions, external service integration setup

For each task, conduct in two conditions: siegeNgin condition and control condition (conventional CMS or code editor) (within-subject design, counterbalanced).

#### 8.3.4 Evaluation Metrics

- **Task Completion Rate**: Percentage of tasks correctly completed within time limits
- **Time on Task**: Time required for task completion
- **SUS (System Usability Scale)** [22]: 10-item system usability scale (0-100 points)
- **NASA-TLX (Task Load Index)** [23]: 6-dimensional subjective workload evaluation (mental demand, physical demand, temporal demand, performance, effort, frustration)
- **Error Rate**: Number and types of errors occurring during task execution
- **Semi-structured interviews**: Approximately 15-minute interviews about user experience, intuitiveness, and improvement requests after task completion

#### 8.3.5 Hypotheses

- **H1**: In the non-technical group, task completion rate in siegeNgin condition is significantly higher than CMS condition
- **H2**: In all groups, SUS scores in siegeNgin condition are significantly higher than CMS/code editor conditions
- **H3**: NASA-TLX scores in siegeNgin condition (especially mental demand and effort) are significantly lower than control conditions
- **H4**: The difference in task completion rates between technical and non-technical groups is significantly smaller in siegeNgin condition than control conditions (verification of decentralization effect)

#### 8.3.6 Implementation Considerations

This study has not been conducted and the above is at the design proposal stage. Implementation requires approval from the institutional review board (IRB) of the affiliated institution. Detailed planning is also needed for participant recruitment, experimental environment standardization (network latency control, browser version control, etc.), and data analysis methods (mixed ANOVA, effect size reporting).

siegeNgin can be positioned as a pioneering case of 21st-century human-AI collaboration that combines the academic significance of practical application of symbol emergence systems theory with the social significance of transforming social authority structures.

## References

[1] Taniguchi, T. (2016). *Symbol Emergence Robotics: Introduction to Intelligence Mechanisms*. Kodansha. (in Japanese)

[2] Harnad, S. (1990). The symbol grounding problem. *Physica D: Nonlinear Phenomena*, 42(1-3), 335-346.

[3] Wittgenstein, L. (1953). *Philosophical Investigations*. Basil Blackwell.

[4] Gibson, J. J. (1979). *The Ecological Approach to Visual Perception*. Houghton Mifflin.

[5] Osawa, M. (2008). *The Age of Impossibility*. Iwanami Shinsho. (in Japanese)

[6] Varela, F. J., Thompson, E., & Rosch, E. (1991). *The Embodied Mind: Cognitive Science and Human Experience*. MIT Press.

[7] Nishigaki, T. (2004). *Fundamental Information Studies: From Life to Society*. NTT Publishing. (in Japanese)

[8] Luhmann, N. (1995). *Social Systems*. Stanford University Press.

[9] Asada, M. (2001). *The Idea of Robots: Challenging the Mystery of Brain and Intelligence*. NHK Publishing. (in Japanese)

[10] Mogi, K. (2007). *What is Consciousness: The Brain that Generates "I"*. Chikuma Shinsho. (in Japanese)

[11] FLOW (2025-2026). A series of essays on symbol emergence systems theory. note.com/teddy_on_web. Particularly refer to:
  - "Re-Buddhism: Redefining Buddhism through Symbol Emergence": https://note.com/teddy_on_web/n/nce153b33fe77
  - "Transformation of Meaning Generation in the Post-Religious Era: New Prospects for Human Evolution through Symbol Emergence Systems Theory"
  - "Scientific Redefinition of Buddhist Dharma: Dharma as Natural Law"
  - "Consideration of Contemporary Society's Declining Birth Rate Based on Symbol Emergence Systems Theory Founded on Evolutionary Theory"

[12] Shneiderman, B. (1983). Direct manipulation: A step beyond programming languages. *Computer*, 16(8), 57-69.

[13] McTear, M. F. (2017). *The conversational interface: Talking to smart devices*. Springer.

[14] Hutchins, E. L., Hollan, J. D., & Norman, D. A. (1985). Direct manipulation interfaces. *Human-Computer Interaction*, 1(4), 311-338.

[15] Husserl, E. (1913). *Ideas: General Introduction to Pure Phenomenology*. Niemeyer. (Japanese translation: *Ideas I*, trans. Jiro Watanabe, Misuzu Shobo)

[16] Gadamer, H.-G. (1960). *Truth and Method*. Mohr Siebeck. (Japanese translation: *Truth and Method*, trans. Osamu Kutsukake et al., Hosei University Press)

[17] Heidegger, M. (1927). *Being and Time*. Niemeyer. (Japanese translation: *Being and Time*, trans. Sadao Hosoya, Chikuma Gakugei Bunko)

[18] Deleuze, G. (1968). *Difference and Repetition*. PUF. (Japanese translation: *Difference and Repetition*, trans. Osamu Zaitsu, Kawade Shobo Shinsha)

[19] James, W. (1912). *Essays in Radical Empiricism*. Longmans, Green and Co.

[20] Dewey, J. (1938). *Logic: The Theory of Inquiry*. Henry Holt and Company.

[21] Peirce, C. S. (1931-1958). *Collected Papers of Charles Sanders Peirce*. Harvard University Press.

[22] Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan et al. (Eds.), *Usability Evaluation in Industry* (pp. 189-194). Taylor & Francis.

[23] Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX (Task Load Index). *Advances in Psychology*, 52, 139-183.

[24] Taniguchi, T., Murata, S., Suzuki, M., Ognibene, D., Lanillos, P., Ugur, E., Jamone, L., Nakamura, T., Ciria, A., Lara, B., & Pezzulo, G. (2023). World models and predictive coding for cognitive and developmental robotics: Frontiers and challenges. *Advanced Robotics*, 37(13), 780-806.

[25] Taniguchi, T., Yoshida, Y., & Matsui, Y. (2024). Collective predictive coding as a model of science: Formalizing scientific activities towards the emergence of scientific knowledge. *arXiv preprint arXiv:2312.09810*.

[26] Taniguchi, T. (2024). *Word Map: Symbol Emergence Systems Theory: Mechanism Analysis of Language and Culture*. Shinyosha. (in Japanese)

[27] Friston, K. (2010). The free-energy principle: A unified brain theory? *Nature Reviews Neuroscience*, 11(2), 127-138.

---

## English Title Proposal

**"Extending Symbol Emergence Theory to Human–LLM Coupling: Pointing as Developmental Compression in Semi-Grounded Digital Environments"**

This title encapsulates the key theoretical contributions of the paper:
- Extension of symbol emergence theory beyond physical robotics to digital human-AI collaboration
- Conceptualization of pointing as a developmental compression mechanism
- Introduction of "semi-grounded digital environments" as a new theoretical category
- Integration of developmental psychology with symbol emergence systems theory

---

*This paper is an academic examination written based on the technical specifications of siegeNgin and theoretical findings of symbol emergence systems theory. For implementation details of the system, please refer to technical documentation by the development team.*

**Author**: Chikara Kawashima (ORCID: 0009-0008-9457-0181)