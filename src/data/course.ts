export type Topic = {
  id: string;
  title: string;
  area: string;
  level: "Foundations" | "Core";
  duration: string;
  summary: string;
  lesson: string[];
  takeaways: string[];
  complexity: string;
  code: string;
};

export type Challenge = {
  id: string;
  title: string;
  topicId: string;
  difficulty: "Easy" | "Medium";
  prompt: string;
  choices: string[];
  answer: number;
  hints: string[];
  explanation: string;
};

export const topics: Topic[] = [
  {
    id: "complexity",
    title: "Time & space complexity",
    area: "Foundations",
    level: "Foundations",
    duration: "8 min",
    summary: "Describe how an algorithm scales as its input grows.",
    lesson: [
      "Big O describes an upper bound on how resource use grows with input size. It helps compare approaches without depending on a particular machine.",
      "Count the work that grows with n. A loop over n items is O(n); a loop inside another n-sized loop is O(n²). Consecutive sections add together, but the faster-growing term dominates.",
      "Space complexity counts extra memory used by the algorithm. An in-place pass may use O(1) extra space, while building a second array of n items uses O(n).",
    ],
    takeaways: [
      "Drop constants and lower-order terms: 3n + 10 becomes O(n).",
      "Nested loops often multiply; sequential blocks usually add.",
      "State whether a space bound includes the input or only extra space.",
    ],
    complexity: "Compare growth, not wall-clock time.",
    code: "for (const item of items) {\n  inspect(item); // n operations\n}\n\nfor (const left of items) {\n  for (const right of items) {\n    compare(left, right); // n × n operations\n  }\n}",
  },
  {
    id: "arrays",
    title: "Arrays & hash maps",
    area: "Data structures",
    level: "Foundations",
    duration: "10 min",
    summary: "Use contiguous storage for indexing and maps for fast lookup.",
    lesson: [
      "An array stores an ordered sequence. Index access is O(1), while searching an unsorted array or inserting at the front takes O(n) because elements may need to move.",
      "A hash map maps keys to values using a hash function. Lookup, insertion, and deletion are O(1) on average, although collisions can make a lookup slower.",
      "When a problem asks whether a value has appeared before, a set or map can replace repeated scans. Trade some extra memory for faster lookups.",
    ],
    takeaways: [
      "Array index access: O(1); scan: O(n).",
      "Hash map operations: O(1) average, not a worst-case guarantee.",
      "A set is useful when only membership matters.",
    ],
    complexity: "Array lookup by index O(1); hash lookup O(1) average.",
    code: "const seen = new Set<number>();\nfor (const value of values) {\n  if (seen.has(target - value)) return true;\n  seen.add(value);\n}",
  },
  {
    id: "stack-queue",
    title: "Stacks & queues",
    area: "Data structures",
    level: "Foundations",
    duration: "9 min",
    summary: "Model last-in-first-out and first-in-first-out workflows.",
    lesson: [
      "A stack is LIFO: the last item pushed is the first one popped. It is useful for undo history, parsing nested expressions, and depth-first search.",
      "A queue is FIFO: the first item enqueued is the first one dequeued. It is useful for scheduling and breadth-first search.",
      "Both structures support adding and removing at their active end in O(1). In JavaScript, avoid repeatedly shifting a large array; a head index or deque avoids moving every remaining item.",
    ],
    takeaways: [
      "Stack: push and pop at the top.",
      "Queue: enqueue at the back, dequeue at the front.",
      "BFS uses a queue; iterative DFS commonly uses a stack.",
    ],
    complexity: "Push/pop or enqueue/dequeue: O(1) with a suitable implementation.",
    code: "const stack: number[] = [];\nstack.push(4); // add to top\nconst top = stack.pop();\n\nconst queue = [4, 7, 9];\nlet head = 0;\nconst next = queue[head++]; // dequeue without shifting",
  },
  {
    id: "binary-search",
    title: "Binary search",
    area: "Algorithms",
    level: "Core",
    duration: "12 min",
    summary: "Halve a sorted search range after every comparison.",
    lesson: [
      "Binary search finds a target in a sorted array by checking the middle element. Each comparison discards half of the remaining candidates.",
      "Maintain a clear interval invariant. With a closed interval [left, right], continue while left <= right. If the middle value is too small, set left = middle + 1; if too large, set right = middle - 1.",
      "Use left + Math.floor((right - left) / 2) for the midpoint. The number of comparisons grows logarithmically, so time is O(log n).",
    ],
    takeaways: [
      "The input must be sorted under the comparison being used.",
      "Move past the midpoint with +1 or -1 to guarantee progress.",
      "Time O(log n); iterative extra space O(1).",
    ],
    complexity: "Time O(log n), extra space O(1).",
    code: "function binarySearch(values: number[], target: number) {\n  let left = 0;\n  let right = values.length - 1;\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2);\n    if (values[mid] === target) return mid;\n    if (values[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
  },
  {
    id: "sorting",
    title: "Sorting fundamentals",
    area: "Algorithms",
    level: "Core",
    duration: "14 min",
    summary: "Understand how comparison-based sorting algorithms trade time and space.",
    lesson: [
      "Sorting places items into an order defined by a comparator. A correct comparator must be consistent so the resulting order is meaningful.",
      "Bubble sort repeatedly swaps adjacent out-of-order values. It is easy to trace but takes O(n²) time in the average and worst case. It is useful for learning, not for large inputs.",
      "Merge sort divides the input, sorts each half, and merges the sorted halves. It runs in O(n log n) time and typically needs O(n) extra space.",
    ],
    takeaways: [
      "Bubble sort: O(n²) average/worst time, O(1) extra space.",
      "Merge sort: O(n log n) time, typically O(n) extra space.",
      "Choose production sorting based on requirements and the language's guarantees.",
    ],
    complexity: "Bubble O(n²); merge O(n log n).",
    code: "for (let end = values.length - 1; end > 0; end--) {\n  for (let i = 0; i < end; i++) {\n    if (values[i] > values[i + 1]) {\n      [values[i], values[i + 1]] = [values[i + 1], values[i]];\n    }\n  }\n}",
  },
  {
    id: "linked-lists",
    title: "Linked lists",
    area: "Data structures",
    level: "Core",
    duration: "11 min",
    summary: "Connect nodes with references instead of contiguous indexes.",
    lesson: [
      "A linked list is a chain of nodes. Each node stores a value and a reference to the next node; a doubly linked list also points to its previous node.",
      "Accessing the item at position k requires following links from the head, so it takes O(n). Inserting after a node you already have takes O(1), but finding that node still takes O(n).",
      "When reversing a singly linked list, keep track of the previous node, current node, and next node so each link can be redirected safely.",
    ],
    takeaways: [
      "Indexed access is O(n), unlike an array's O(1).",
      "Insertion/removal is O(1) once the relevant node is known.",
      "Be careful not to lose the next reference when rewiring links.",
    ],
    complexity: "Search/index access O(n); insert after known node O(1).",
    code: "let previous: Node | null = null;\nlet current: Node | null = head;\nwhile (current) {\n  const next = current.next;\n  current.next = previous;\n  previous = current;\n  current = next;\n}",
  },
];

export const challenges: Challenge[] = [
  {
    id: "complexity-loop",
    title: "Count the work",
    topicId: "complexity",
    difficulty: "Easy",
    prompt: "A loop visits each item once. What is its time complexity in terms of n?",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    hints: ["Count how many iterations happen when the input doubles.", "The loop body runs once for every input item."],
    explanation: "There is one iteration per item, so the work grows linearly with n: O(n).",
  },
  {
    id: "two-sum-map",
    title: "Remember what you saw",
    topicId: "arrays",
    difficulty: "Easy",
    prompt: "You scan a list once and use a hash set to check for a needed complement. What is the average time complexity?",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    hints: ["How many times does the outer scan visit an item?", "Each set lookup is O(1) on average."],
    explanation: "The scan performs n average-constant-time set operations, so the expected total is O(n).",
  },
  {
    id: "queue-order",
    title: "Choose the right order",
    topicId: "stack-queue",
    difficulty: "Easy",
    prompt: "A support desk handles requests in the order they arrive. Which structure matches this behavior?",
    choices: ["Stack (LIFO)", "Queue (FIFO)", "Binary search tree", "Hash map"],
    answer: 1,
    hints: ["The earliest arrival should be handled first.", "Think first-in-first-out."],
    explanation: "A queue is FIFO, so the first request enqueued is the first request dequeued.",
  },
  {
    id: "binary-precondition",
    title: "Before you halve",
    topicId: "binary-search",
    difficulty: "Easy",
    prompt: "What must be true about a basic binary-search array before searching?",
    choices: ["It contains unique values.", "It is sorted.", "Its length is a power of two.", "It has no negative values."],
    answer: 1,
    hints: ["Discarding half only works when order tells you which half can be ruled out.", "Equal spacing is not required, but ordering is."],
    explanation: "Binary search relies on sorted order to know which half cannot contain the target.",
  },
  {
    id: "bubble-sort",
    title: "Adjacent comparisons",
    topicId: "sorting",
    difficulty: "Medium",
    prompt: "For a reverse-sorted array, what is bubble sort's worst-case time complexity?",
    choices: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    answer: 3,
    hints: ["Many passes compare adjacent pairs.", "The number of comparisons grows roughly like n × n."],
    explanation: "Bubble sort performs a quadratic number of comparisons in the worst case: O(n²).",
  },
  {
    id: "list-index",
    title: "Find the middle node",
    topicId: "linked-lists",
    difficulty: "Medium",
    prompt: "How long does it take to access the k-th element in a singly linked list if you only have its head?",
    choices: ["O(1)", "O(log n)", "O(k), which is O(n) in the worst case", "O(n²)"],
    answer: 2,
    hints: ["There is no direct numeric index on a node.", "Follow next references one by one."],
    explanation: "You must traverse from the head through k links. In the worst case, this is O(n).",
  },
];

export function getTopic(topicId: string) {
  return topics.find((topic) => topic.id === topicId);
}
