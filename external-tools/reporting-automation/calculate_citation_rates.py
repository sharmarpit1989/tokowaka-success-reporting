import pandas as pd
import numpy as np
from urllib.parse import urlparse
import sys
import os
import re
import glob

# Get input file from command line arguments or use default
if len(sys.argv) >= 2:
    input_file = sys.argv[1]
    folder_name = sys.argv[2] if len(sys.argv) >= 3 else 'unknown'
    output_folder = sys.argv[3] if len(sys.argv) >= 4 else None
    timestamp = sys.argv[4] if len(sys.argv) >= 5 else None
else:
    # If no arguments, try to find the most recent brandpresence file in Output folder
    # Search in subdirectories of Output folder
    files = glob.glob(os.path.join('Output', '**', 'brandpresence-full-combined-*.xlsx'), recursive=True)
    if not files:
        # Fallback to root Output folder for backward compatibility
        files = glob.glob(os.path.join('Output', 'brandpresence-full-combined-*.xlsx'))
    
    if files:
        # Get the most recently modified file
        input_file = max(files, key=os.path.getmtime)
        # Extract folder name and timestamp from filename
        basename = os.path.basename(input_file)
        # Try to extract timestamp from filename (pattern: folder_name_YYYYMMDD_HHMMSS.xlsx)
        timestamp_match = re.search(r'_(\d{8}_\d{6})\.xlsx$', basename)
        if timestamp_match:
            timestamp = timestamp_match.group(1)
            # Remove timestamp from basename to get folder_name
            folder_name = basename.replace('brandpresence-full-combined-', '').replace(f'_{timestamp}.xlsx', '')
        else:
            timestamp = None
            folder_name = basename.replace('brandpresence-full-combined-', '').replace('.xlsx', '')
        # Get the parent directory as output_folder
        output_folder = os.path.dirname(input_file)
        print(f"\n⚠️  No input file specified. Using most recent: {input_file}")
    else:
        print("\n⚠️  Error: No brandpresence-full-combined file found in 'Output' folder!")
        print("Please run combine_brandpresence_data.py first.")
        sys.exit(1)

# Read the combined data
if not os.path.exists(input_file):
    print(f"\n⚠️  Error: File '{input_file}' not found!")
    sys.exit(1)

# Try to read URLs from the Excel file first, fall back to urls.csv if not found
try:
    urls_df = pd.read_excel(input_file, sheet_name='target_urls')
    urls_list = urls_df['urls'].tolist()
    urls_source = "from Excel file (target_urls sheet)"
except:
    # Fallback to urls.csv for backward compatibility
    if os.path.exists('urls.csv'):
        urls_df = pd.read_csv('urls.csv')
        urls_list = urls_df['urls'].tolist()
        urls_source = "from urls.csv (fallback)"
    else:
        print("\n⚠️  Error: Could not find target URLs!")
        print("Expected either 'target_urls' sheet in Excel file or 'urls.csv' file.")
        sys.exit(1)

print("=" * 80)
print("CITATION RATE CALCULATION")
print("=" * 80)
print(f"\nAnalyzing: {input_file}")
print(f"Folder: {folder_name}")
print(f"URLs source: {urls_source}")
print(f"\nURLs to analyze ({len(urls_list)}):")
# Show first 10 URLs
for i, url in enumerate(urls_list[:10], 1):
    print(f"  {i}. {url}")
if len(urls_list) > 10:
    print(f"  ... and {len(urls_list) - 10} more URLs")

df = pd.read_excel(input_file, sheet_name='combined_data')

print(f"\nTotal rows in dataset: {len(df)}")
print(f"Weeks: {sorted(df['week'].unique())}")
print(f"Platforms: {sorted(df['platform'].unique())}")

# Function to check if a specific URL is cited in the Sources column
def url_is_cited(sources_value, target_url):
    """Check if target_url appears in the sources string with EXACT path matching"""
    if pd.isna(sources_value):
        return False
    
    # Convert to string and split by semicolon
    sources_str = str(sources_value)
    
    # Parse target URL
    target_parsed = urlparse(target_url)
    target_domain = target_parsed.netloc.lower()
    target_path = target_parsed.path.rstrip('/').lower()
    
    # Split by semicolon and check each source
    sources_list = [s.strip() for s in sources_str.split(';')]
    
    for source in sources_list:
        if not source:
            continue
            
        source_parsed = urlparse(source)
        source_domain = source_parsed.netloc.lower()
        
        # Remove fragments (#) and query parameters (?) for path comparison
        source_path = source_parsed.path.split('#')[0].split('?')[0].rstrip('/').lower()
        
        # Check if domains AND paths match exactly
        if source_domain == target_domain and source_path == target_path:
            return True
    
    return False

# Prepare results
platform_results = []

print("\n" + "=" * 80)
print("CALCULATING CITATION RATES BY WEEK AND PLATFORM")
print("=" * 80)

# Calculate citation rates by platform
platforms = sorted(df['platform'].unique())
weeks = sorted(df['week'].unique())

for week in weeks:
    for platform in platforms:
        # Filter data for this week and platform
        mask = (df['week'] == week) & (df['platform'] == platform)
        df_filtered = df[mask].copy()
        
        total_rows = len(df_filtered)
        
        if total_rows == 0:
            continue
        
        # Calculate unique prompts with owned citations (ANY domain URL cited)
        # This counts UNIQUE prompts where any_url_from_domain = 'Y' (includes all domain URLs)
        unique_prompts_with_owned_citations = df_filtered[
            df_filtered['any_url_from_domain'] == 'Y'
        ]['Prompt'].nunique()
        
        # Count rows where any_url_from_domain_excluding_specified_URLs = 'Y' (other domain URLs cited, not in urls.csv)
        any_url_from_domain_excluding_specified_urls_citations = df_filtered[
            df_filtered['any_url_from_domain_excluding_specified_URLs'] == 'Y'
        ].shape[0]
        
        # Calculate citation rate for each URL
        for url in urls_list:
            # Find rows where this URL is cited AND selected_url_cited? = 'Y'
            df_filtered['url_present'] = df_filtered['Sources'].apply(
                lambda x: url_is_cited(x, url)
            )
            
            # Count rows where URL is present AND selected_url_cited? = 'Y'
            rows_cited = df_filtered[
                (df_filtered['url_present']) & 
                (df_filtered['selected_url_cited?'] == 'Y')
            ].shape[0]
            
            # Citation rate = rows with this URL cited / total rows for week/platform
            citation_rate = rows_cited / total_rows if total_rows > 0 else 0
            
            platform_results.append({
                'Week': week,
                'Platform': platform,
                'URL': url,
                'Total_prompt_executions': total_rows,
                'Rows_with_Selected_URL_Cited': rows_cited,
                'selected_URL_Citation_Rate': citation_rate,
                'Unique_Prompts_with_Owned_Citations': unique_prompts_with_owned_citations,
                'any_url_from_domain_excluding_specified_URLs_Citations': any_url_from_domain_excluding_specified_urls_citations
            })

# Create results DataFrame
platform_results_df = pd.DataFrame(platform_results)

# Create a summary of owned citations by week/platform directly from the original dataframe
owned_citations_summary = df.groupby(['week', 'platform']).agg({
    'Prompt': 'count',  # Total prompt executions
    'selected_url_cited?': lambda x: (x == 'Y').sum(),  # Selected URL citations count
    'any_url_from_domain': lambda x: (x == 'Y').nunique() if (x == 'Y').any() else 0,  # Count if any domain URL cited
    'any_url_from_domain_excluding_specified_URLs': lambda x: (x == 'Y').sum()  # Other domain URLs count
}).reset_index()

# Get unique prompts with owned citations (any domain URL cited)
unique_prompts_summary = df[df['any_url_from_domain'] == 'Y'].groupby(['week', 'platform']).agg({
    'Prompt': 'nunique'
}).reset_index()
unique_prompts_summary.columns = ['week', 'platform', 'Unique_Prompts_with_Owned_Citations']

# Merge the summaries
owned_citations_summary = owned_citations_summary.merge(
    unique_prompts_summary,
    on=['week', 'platform'],
    how='left'
)

# Fill NaN values with 0 for weeks/platforms with no owned citations
owned_citations_summary['Unique_Prompts_with_Owned_Citations'] = owned_citations_summary['Unique_Prompts_with_Owned_Citations'].fillna(0).astype(int)

# Rename columns for better readability
owned_citations_summary.columns = [
    'Week', 
    'Platform', 
    'Total_prompt_executions', 
    'Selected_URL_Citations',
    'any_url_from_domain_count',  # Temporary column
    'any_url_from_domain_excluding_specified_URLs_Citations',
    'Unique_Prompts_with_Owned_Citations'
]

# Drop the temporary column
owned_citations_summary = owned_citations_summary[[
    'Week', 
    'Platform', 
    'Total_prompt_executions', 
    'Selected_URL_Citations',
    'any_url_from_domain_excluding_specified_URLs_Citations',
    'Unique_Prompts_with_Owned_Citations'
]]

print("\n" + "=" * 80)
print("OWNED CITATIONS SUMMARY (Any domain URL cited)")
print("=" * 80)
print("\nShows how many UNIQUE prompts had ANY URL from your domain cited in sources:")
print("\nColumn Definitions:")
print("  • Total_prompt_executions = Total prompts for week/platform")
print("  • Selected_URL_Citations = Rows with URLs from input file cited")
print("  • any_url_from_domain_excluding_specified_URLs_Citations = Rows with OTHER domain URLs cited (excluding input file URLs)")
print("  • Unique_Prompts_with_Owned_Citations = UNIQUE prompts with ANY domain URL cited (all domain URLs)")
print()
print(owned_citations_summary.to_string(index=False))

# Print platform breakdown summary
print("\n" + "=" * 80)
print("PLATFORM BREAKDOWN: Citation Rates by Platform and Week")
print("=" * 80)
print("\nColumn Definitions:")
print("  • Total_prompt_executions = Total prompts run for week/platform")
print("  • Rows_with_Selected_URL_Cited = Prompts where this specific URL is marked as cited")
print("  • selected_URL_Citation_Rate = Rows_with_Selected_URL_Cited / Total_prompt_executions")
print("=" * 80)

for url in urls_list:
    print(f"\n{'=' * 80}")
    print(f"URL: {url}")
    print(f"{'=' * 80}")
    
    # Filter for this URL
    mask = (platform_results_df['URL'] == url)
    url_platform_data = platform_results_df[mask].copy()
    
    if len(url_platform_data) == 0:
        print("  No data available")
        continue
    
    # Pivot to show platforms as rows and weeks as columns
    pivot = url_platform_data.pivot(index='Platform', columns='Week', values='selected_URL_Citation_Rate')
    
    # Format as percentages
    pivot_formatted = pivot.copy()
    for col in pivot_formatted.columns:
        pivot_formatted[col] = pivot_formatted[col].apply(lambda x: f"{x:.2%}" if pd.notna(x) else "0.00%")
    
    print(pivot_formatted.to_string())

# Use provided output folder or default to 'Output'
if output_folder is None:
    output_folder = 'Output'

# Create output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Save to Excel with folder name and timestamp in filename
if timestamp:
    output_filename = f'citation_rates_by_url-{folder_name}_{timestamp}.xlsx'
else:
    output_filename = f'citation_rates_by_url-{folder_name}.xlsx'
output_file = os.path.join(output_folder, output_filename)
with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    # Save owned citations summary
    owned_citations_summary.to_excel(writer, sheet_name='Owned Citations Summary', index=False)
    # Save platform breakdown (remove summary columns to keep it focused on individual URLs)
    platform_results_for_export = platform_results_df.drop(
        columns=['Unique_Prompts_with_Owned_Citations', 'Total_prompt_executions', 'any_url_from_domain_excluding_specified_URLs_Citations']
    )
    platform_results_for_export.to_excel(writer, sheet_name='By Week-URL-Platform', index=False)

print(f"\n\n{'=' * 80}")
print(f"Results saved to: {output_file}")
print(f"{'=' * 80}")
print("\nExcel file contains:")
print("  - Owned Citations Summary: Prompts with ANY domain URL cited (Selected + Other)")
print("  - By Week-URL-Platform: Detailed breakdown by Week, Platform, and URL")
