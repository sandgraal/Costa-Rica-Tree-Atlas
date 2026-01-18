#!/usr/bin/env python3
"""Parse Lighthouse HTML report and extract key metrics."""
import re
import json
import sys

def parse_lighthouse_report(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    match = re.search(r'window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\});', content, re.DOTALL)
    if not match:
        print("Could not find Lighthouse JSON in the file")
        return
    
    data = json.loads(match.group(1))
    audits = data.get('audits', {})
    
    print("=" * 60)
    print("LIGHTHOUSE REPORT")
    print("=" * 60)
    print(f"URL: {data.get('finalDisplayedUrl', 'N/A')}")
    
    print("\nSCORES:")
    print("-" * 40)
    for cat_id, cat in data.get('categories', {}).items():
        score = int(cat['score'] * 100) if cat['score'] else 0
        status = "PASS" if score >= 90 else "NEEDS WORK" if score >= 50 else "POOR"
        print(f"  {cat['title']}: {score} [{status}]")
    
    print("\nCORE WEB VITALS:")
    print("-" * 40)
    metrics = [
        ('first-contentful-paint', 'FCP'),
        ('largest-contentful-paint', 'LCP'),
        ('total-blocking-time', 'TBT'),
        ('cumulative-layout-shift', 'CLS'),
        ('speed-index', 'Speed Index'),
    ]
    for audit_id, label in metrics:
        if audit_id in audits:
            audit = audits[audit_id]
            value = audit.get('displayValue', 'N/A')
            print(f"  {label}: {value}")
    
    print("\nOPPORTUNITIES (by potential savings):")
    print("-" * 40)
    opps = []
    for audit_id, audit in audits.items():
        det = audit.get('details', {})
        if det.get('type') == 'opportunity':
            savings = det.get('overallSavingsMs', 0)
            if savings > 0:
                opps.append((audit['title'], savings))
    opps.sort(key=lambda x: x[1], reverse=True)
    for title, savings in opps[:10]:
        print(f"  - {title}: ~{savings/1000:.1f}s")
    
    print("\nFAILED AUDITS:")
    print("-" * 40)
    failed = []
    for audit_id, audit in audits.items():
        score = audit.get('score')
        mode = audit.get('scoreDisplayMode', '')
        if score is not None and score < 0.9 and mode not in ['manual', 'notApplicable', 'informative']:
            failed.append((audit['title'], score))
    failed.sort(key=lambda x: x[1])
    for title, score in failed[:15]:
        print(f"  - {title} (score: {int(score*100) if score else 0})")

if __name__ == '__main__':
    filepath = sys.argv[1] if len(sys.argv) > 1 else '/Users/christopherennis/Downloads/costaricatreeatlas.org-20260117T212945.html'
    parse_lighthouse_report(filepath)
