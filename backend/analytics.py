"""
Text analytics module for word frequency analysis, n-grams, and word correlations.
"""

from collections import Counter
from dataclasses import dataclass
from typing import List, Set, Tuple, Optional, Dict
from pathlib import Path
import re
import math

# Default English stopwords - common words to filter out
DEFAULT_STOPWORDS: Set[str] = {
    # Articles
    'a', 'an', 'the',
    # Pronouns
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
    'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
    'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
    'these', 'those',
    # Verbs (common)
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could',
    'ought', 'might', 'must', 'shall', 'will', 'can', 'may',
    # Prepositions
    'at', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'to', 'with',
    'about', 'against', 'between', 'through', 'during', 'before', 'after',
    'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
    'further', 'then', 'once',
    # Conjunctions
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
    'not', 'only', 'own', 'same', 'than', 'too', 'very',
    # Other common words
    'as', 'if', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'any', 'here',
    'there', 'just', 'also', 'now', 'even', 'well', 'back', 'still', 'way',
    'because', 'while', 'although', 'though', 'since', 'until', 'unless',
    # Video description common words
    'video', 'shows', 'appears', 'seen', 'visible', 'scene', 'frame', 'clip',
}

# Minimal stopwords - only the most common function words
MINIMAL_STOPWORDS: Set[str] = {
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
}


@dataclass
class WordFrequencyResult:
    """Result of word frequency analysis"""
    word: str
    count: int
    frequency: float  # Percentage of total words (0-1)


@dataclass
class NgramResult:
    """Result of n-gram analysis"""
    ngram: Tuple[str, ...]
    count: int
    frequency: float


@dataclass
class CorrelationResult:
    """Word co-occurrence correlation using PMI"""
    word1: str
    word2: str
    co_occurrence_count: int
    pmi_score: float  # Pointwise Mutual Information


def tokenize_text(
    text: str,
    lowercase: bool = True,
    min_word_length: int = 2
) -> List[str]:
    """
    Tokenize text into words.

    Args:
        text: Input text to tokenize
        lowercase: Whether to convert to lowercase
        min_word_length: Minimum word length to include

    Returns:
        List of word tokens
    """
    if lowercase:
        text = text.lower()

    # Extract words (alphanumeric sequences)
    words = re.findall(r'\b[a-zA-Z]+\b', text)

    # Filter by minimum length
    if min_word_length > 1:
        words = [w for w in words if len(w) >= min_word_length]

    return words


def calculate_word_frequency(
    texts: List[str],
    stopwords: Optional[Set[str]] = None,
    min_word_length: int = 2,
    top_n: int = 50
) -> List[WordFrequencyResult]:
    """
    Calculate word frequencies across multiple texts.

    Args:
        texts: List of caption texts to analyze
        stopwords: Set of words to exclude (None = use defaults)
        min_word_length: Minimum word length to include
        top_n: Number of top words to return

    Returns:
        List of WordFrequencyResult sorted by count descending
    """
    if stopwords is None:
        stopwords = DEFAULT_STOPWORDS

    # Tokenize all texts and count words
    word_counter: Counter = Counter()

    for text in texts:
        words = tokenize_text(text, lowercase=True, min_word_length=min_word_length)
        # Filter stopwords
        filtered_words = [w for w in words if w not in stopwords]
        word_counter.update(filtered_words)

    # Calculate total for frequency
    total_count = sum(word_counter.values())
    if total_count == 0:
        return []

    # Get top N and convert to results
    results = []
    for word, count in word_counter.most_common(top_n):
        results.append(WordFrequencyResult(
            word=word,
            count=count,
            frequency=count / total_count
        ))

    return results


def calculate_ngrams(
    texts: List[str],
    n: int = 2,
    stopwords: Optional[Set[str]] = None,
    min_word_length: int = 2,
    top_n: int = 30,
    min_count: int = 2
) -> List[NgramResult]:
    """
    Calculate n-gram frequencies.

    Args:
        texts: List of caption texts
        n: Size of n-gram (2 for bigrams, 3 for trigrams)
        stopwords: Words to filter out
        min_word_length: Minimum word length
        top_n: Number of top n-grams to return
        min_count: Minimum occurrences to include

    Returns:
        List of NgramResult sorted by count descending
    """
    if stopwords is None:
        stopwords = DEFAULT_STOPWORDS

    ngram_counter: Counter = Counter()

    for text in texts:
        words = tokenize_text(text, lowercase=True, min_word_length=min_word_length)
        # Filter stopwords
        filtered_words = [w for w in words if w not in stopwords]

        # Generate n-grams
        for i in range(len(filtered_words) - n + 1):
            ngram = tuple(filtered_words[i:i + n])
            ngram_counter[ngram] += 1

    # Filter by minimum count and get total
    filtered_counter = {k: v for k, v in ngram_counter.items() if v >= min_count}
    total_count = sum(filtered_counter.values())

    if total_count == 0:
        return []

    # Sort and return top N
    sorted_ngrams = sorted(filtered_counter.items(), key=lambda x: x[1], reverse=True)[:top_n]

    results = []
    for ngram, count in sorted_ngrams:
        results.append(NgramResult(
            ngram=ngram,
            count=count,
            frequency=count / total_count
        ))

    return results


def calculate_word_correlations(
    texts: List[str],
    stopwords: Optional[Set[str]] = None,
    min_word_length: int = 2,
    window_size: int = 5,
    min_co_occurrence: int = 3,
    top_n: int = 50
) -> List[CorrelationResult]:
    """
    Calculate word co-occurrence correlations using Pointwise Mutual Information (PMI).

    PMI(x,y) = log2(P(x,y) / (P(x) * P(y)))
    Higher PMI indicates words that appear together more than by chance.

    Args:
        texts: List of caption texts
        stopwords: Words to filter out
        min_word_length: Minimum word length
        window_size: Context window for co-occurrence
        min_co_occurrence: Minimum co-occurrences to include
        top_n: Number of top correlations to return

    Returns:
        List of CorrelationResult sorted by PMI score descending
    """
    if stopwords is None:
        stopwords = DEFAULT_STOPWORDS

    # Count individual word occurrences and co-occurrences
    word_counter: Counter = Counter()
    pair_counter: Counter = Counter()
    total_windows = 0

    for text in texts:
        words = tokenize_text(text, lowercase=True, min_word_length=min_word_length)
        filtered_words = [w for w in words if w not in stopwords]

        # Count individual words
        word_counter.update(filtered_words)

        # Count co-occurrences within window
        for i in range(len(filtered_words)):
            window_end = min(i + window_size, len(filtered_words))
            for j in range(i + 1, window_end):
                # Create sorted pair to avoid duplicates
                pair = tuple(sorted([filtered_words[i], filtered_words[j]]))
                pair_counter[pair] += 1
                total_windows += 1

    if total_windows == 0:
        return []

    total_words = sum(word_counter.values())

    # Calculate PMI for each pair
    results = []
    for pair, co_count in pair_counter.items():
        if co_count < min_co_occurrence:
            continue

        word1, word2 = pair
        count1 = word_counter[word1]
        count2 = word_counter[word2]

        # Calculate probabilities
        p_x = count1 / total_words
        p_y = count2 / total_words
        p_xy = co_count / total_windows

        # Calculate PMI (with smoothing to avoid log(0))
        if p_x > 0 and p_y > 0 and p_xy > 0:
            pmi = math.log2(p_xy / (p_x * p_y))
            results.append(CorrelationResult(
                word1=word1,
                word2=word2,
                co_occurrence_count=co_count,
                pmi_score=pmi
            ))

    # Sort by PMI score and return top N
    results.sort(key=lambda x: x.pmi_score, reverse=True)
    return results[:top_n]


def get_caption_texts_from_directory(
    directory: Path,
    traverse_subfolders: bool = False,
    video_names: Optional[List[str]] = None
) -> List[Tuple[str, str]]:
    """
    Read caption texts from a directory.

    Args:
        directory: Working directory containing caption files
        traverse_subfolders: Whether to search recursively
        video_names: Specific videos to analyze (None = all)

    Returns:
        List of (video_name, caption_text) tuples
    """
    if not directory.exists():
        return []

    # Determine glob pattern
    pattern = "**/*.txt" if traverse_subfolders else "*.txt"

    results = []
    for caption_path in directory.glob(pattern):
        # Skip hidden files
        if caption_path.name.startswith('.'):
            continue

        video_name = caption_path.stem

        # Filter by specific videos if provided
        if video_names is not None:
            # Match against stem (without extension)
            matching = any(
                video_name == Path(v).stem or video_name == v
                for v in video_names
            )
            if not matching:
                continue

        try:
            caption_text = caption_path.read_text(encoding='utf-8')

            # Strip metadata section if present
            if '\n============' in caption_text:
                caption_text = caption_text.split('\n============')[0]

            caption_text = caption_text.strip()
            if caption_text:
                results.append((video_name, caption_text))
        except Exception:
            # Skip files that can't be read
            continue

    return results


def get_stopwords_for_preset(preset: str, custom_stopwords: Optional[List[str]] = None) -> Set[str]:
    """
    Get stopwords set based on preset name.

    Args:
        preset: 'none', 'minimal', or 'english'
        custom_stopwords: Additional words to add

    Returns:
        Set of stopwords
    """
    if preset == 'none':
        base = set()
    elif preset == 'minimal':
        base = MINIMAL_STOPWORDS.copy()
    else:  # 'english' or default
        base = DEFAULT_STOPWORDS.copy()

    if custom_stopwords:
        base.update(word.lower() for word in custom_stopwords)

    return base
