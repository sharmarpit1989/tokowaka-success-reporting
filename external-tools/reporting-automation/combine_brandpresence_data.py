import pandas as pd
import os
import glob
from urllib.parse import urlparse
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime

print("\n" + "=" * 80)
print("BRAND PRESENCE DATA ANALYSIS")
print("=" * 80)

# Function to extract week from filename
def extract_week_from_filename(filename):
    """Extract week number from filename like 'brandpresence-chatgpt-w44-2025.xlsx'"""
    match = re.search(r'w(\d+)', filename.lower())
    if match:
        return f"w{match.group(1)}"
    return None

# Function to extract platform from filename
def extract_platform_from_filename(filename):
    """Extract platform from filename like 'brandpresence-chatgpt-w44-2025.xlsx'"""
    # Remove path and extension
    basename = os.path.basename(filename).lower()
    basename = basename.replace('.xlsx', '').replace('.xls', '')
    
    # Split by '-' and get the platform part (between 'brandpresence' and week)
    parts = basename.split('-')
    
    # Find the platform (everything between 'brandpresence' and the week)
    platform_parts = []
    for i, part in enumerate(parts):
        if i == 0 and part == 'brandpresence':
            continue
        if re.match(r'w\d+', part):  # Stop at week
            break
        if part.isdigit():  # Stop at year
            break
        platform_parts.append(part)
    
    platform = '-'.join(platform_parts) if platform_parts else 'unknown'
    
    # Normalize platform names
    platform_mapping = {
        'ai mode': 'ai-mode',
        'chatgpt': 'chatgpt',
        'copilot': 'copilot',
        'gemini': 'gemini',
        'google ai overviews': 'google-ai-overviews',
        'perplexity': 'perplexity',
        'all': 'all'  # Note: 'all' gets converted to 'ChatGPT-Paid' later
    }
    
    return platform_mapping.get(platform, platform)

# Function to check if any target URL is cited in the Sources column
def check_url_cited(sources_value, target_urls_list):
    """
    Check if any of the target URLs appears in the sources string.
    EXACT path matching - ignores # fragments and ? query parameters, but paths must match exactly.
    """
    if pd.isna(sources_value):
        return 'N'
    
    sources_str = str(sources_value).strip()
    if not sources_str:
        return 'N'
    
    # Split sources by semicolon
    sources_list = [s.strip() for s in sources_str.split(';')]
    
    for target_url in target_urls_list:
        target_parsed = urlparse(target_url)
        target_domain = target_parsed.netloc.lower()
        target_path = target_parsed.path.rstrip('/').lower()
        
        for source in sources_list:
            if not source:
                continue
                
            source_parsed = urlparse(source)
            source_domain = source_parsed.netloc.lower()
            
            # Remove fragments (#) and query parameters (?) for path comparison
            source_path = source_parsed.path.split('#')[0].split('?')[0].rstrip('/').lower()
            
            # Check if domains AND paths match exactly
            if source_domain == target_domain and source_path == target_path:
                return 'Y'
    
    return 'N'

# Function to check if any URL from target domains is cited in the Sources column
# INCLUDING all URLs from the domain
def check_any_domain_url_cited(sources_value, target_domains_set):
    """
    Check if ANY URL from the target domains appears in the sources string.
    
    Returns 'Y' if there's any URL from the domain (including specified URLs).
    Returns 'N' if no domain URLs are present.
    """
    if pd.isna(sources_value):
        return 'N'
    
    sources_str = str(sources_value).strip()
    if not sources_str:
        return 'N'
    
    # Split sources by semicolon
    sources_list = [s.strip() for s in sources_str.split(';')]
    
    for source in sources_list:
        if not source:
            continue
            
        source_parsed = urlparse(source)
        source_domain = source_parsed.netloc.lower()
        
        # Check if this source domain matches any of our target domains
        if source_domain in target_domains_set:
            return 'Y'
    
    return 'N'

# Function to check if any URL from target domains is cited in the Sources column
# EXCLUDING the specific URLs from urls.csv
def check_domain_cited_excluding_specified(sources_value, target_domains_set, target_urls_list):
    """
    Check if any URL from the target domains appears in the sources string,
    EXCLUDING the specific URLs listed in urls.csv.
    
    Returns 'Y' if there's a URL from the domain that is NOT one of the selected URLs.
    Returns 'N' if only selected URLs are present, or no domain URLs are present.
    """
    if pd.isna(sources_value):
        return 'N'
    
    sources_str = str(sources_value).strip()
    if not sources_str:
        return 'N'
    
    # Split sources by semicolon
    sources_list = [s.strip() for s in sources_str.split(';')]
    
    # Build a set of normalized target URLs (domain + path) to exclude
    excluded_urls = set()
    for target_url in target_urls_list:
        target_parsed = urlparse(target_url)
        target_domain = target_parsed.netloc.lower()
        target_path = target_parsed.path.rstrip('/').lower()
        
        # Add both with and without 'www.' to handle variations
        excluded_urls.add((target_domain, target_path))
        
        # Also add the alternate version (www <-> non-www)
        if target_domain.startswith('www.'):
            alt_domain = target_domain[4:]  # Remove 'www.'
            excluded_urls.add((alt_domain, target_path))
        else:
            alt_domain = 'www.' + target_domain  # Add 'www.'
            excluded_urls.add((alt_domain, target_path))
    
    for source in sources_list:
        if not source:
            continue
            
        source_parsed = urlparse(source)
        source_domain = source_parsed.netloc.lower()
        
        # Check if this source domain matches any of our target domains
        if source_domain in target_domains_set:
            # Remove fragments (#) and query parameters (?) for path comparison
            source_path = source_parsed.path.split('#')[0].split('?')[0].rstrip('/').lower()
            
            # Check if this specific URL is in our excluded list
            if (source_domain, source_path) not in excluded_urls:
                # Found a URL from target domain that is NOT in urls.csv
                return 'Y'
    
    return 'N'

# List available folders in brand-presence-data
base_folder = 'brand-presence-data'
if not os.path.exists(base_folder):
    print(f"\n⚠️  Error: '{base_folder}' folder not found!")
    print("Please create the folder structure first.")
    sys.exit(1)

# Get all subdirectories in brand-presence-data
available_folders = [f for f in os.listdir(base_folder) 
                     if os.path.isdir(os.path.join(base_folder, f))]

if not available_folders:
    print(f"\n⚠️  Error: No folders found in '{base_folder}'!")
    sys.exit(1)

# Display available folders
print("\n" + "=" * 80)
print("SELECT FOLDER TO ANALYZE")
print("=" * 80)
print(f"\nFound {len(available_folders)} folder(s) in '{base_folder}':\n")
for i, folder in enumerate(sorted(available_folders), 1):
    folder_path_temp = os.path.join(base_folder, folder)
    file_count = len(glob.glob(os.path.join(folder_path_temp, '*.xlsx')))
    print(f"  {i}. {folder} ({file_count} Excel files)")

# Ask user to select a folder
print("\n" + "=" * 80)
while True:
    try:
        selection = input("Enter the number of the folder to analyze (or 'q' to quit): ").strip()
        
        if selection.lower() == 'q':
            print("\nAnalysis cancelled.")
            sys.exit(0)
        
        selection_num = int(selection)
        if 1 <= selection_num <= len(available_folders):
            selected_folder = sorted(available_folders)[selection_num - 1]
            break
        else:
            print(f"⚠️  Please enter a number between 1 and {len(available_folders)}")
    except ValueError:
        print("⚠️  Please enter a valid number")

# Get all Excel files from selected folder
folder_path = os.path.join(base_folder, selected_folder)
excel_files = glob.glob(os.path.join(folder_path, '*.xlsx'))

print("\n" + "=" * 80)
print(f"SELECTED FOLDER: {selected_folder}")
print("=" * 80)
print(f"\n{len(excel_files)} Excel files found in '{folder_path}' folder")

# Check if Input Excels folder exists
input_excels_folder = 'Input Excels'
if not os.path.exists(input_excels_folder) or not os.path.isdir(input_excels_folder):
    print(f"\n⚠️  Error: '{input_excels_folder}' folder not found!")
    print("Please create the folder and add your URL files.")
    sys.exit(1)

# Get all CSV and Excel files from Input Excels folder
input_files = []
input_files.extend(glob.glob(os.path.join(input_excels_folder, '*.csv')))
input_files.extend(glob.glob(os.path.join(input_excels_folder, '*.xlsx')))
input_files.extend(glob.glob(os.path.join(input_excels_folder, '*.xls')))

if not input_files:
    print(f"\n⚠️  Error: No files found in '{input_excels_folder}' folder!")
    print("Please add CSV or Excel files with URLs to analyze.")
    sys.exit(1)

# Display available files and ask user to select one
print("\n" + "=" * 80)
print("SELECT INPUT FILE")
print("=" * 80)
print(f"\nFound {len(input_files)} file(s) in '{input_excels_folder}' folder:\n")
for i, file_path in enumerate(sorted(input_files), 1):
    filename = os.path.basename(file_path)
    print(f"  {i}. {filename}")

# Ask user to select a file
print("\n" + "=" * 80)
while True:
    try:
        file_selection = input(f"Enter the number of the file to use (1-{len(input_files)}, or 'q' to quit): ").strip()
        
        if file_selection.lower() == 'q':
            print("\nAnalysis cancelled.")
            sys.exit(0)
        
        file_num = int(file_selection)
        if 1 <= file_num <= len(input_files):
            selected_input_file = sorted(input_files)[file_num - 1]
            print(f"\n✓ Selected: {os.path.basename(selected_input_file)}")
            break
        else:
            print(f"⚠️  Please enter a number between 1 and {len(input_files)}")
    except ValueError:
        print("⚠️  Please enter a valid number")

# Read URLs from selected file
print("\n" + "=" * 80)
print(f"READING URLs FROM {os.path.basename(selected_input_file)}")
print("=" * 80)

# Determine file type and read accordingly
file_extension = os.path.splitext(selected_input_file)[1].lower()

try:
    if file_extension == '.csv':
        urls_df = pd.read_csv(selected_input_file)
    elif file_extension in ['.xlsx', '.xls']:
        urls_df = pd.read_excel(selected_input_file)
    else:
        print(f"⚠️  Unsupported file format: {file_extension}")
        sys.exit(1)
    
    # Try to find the URLs column (case-insensitive)
    url_column = None
    for col in urls_df.columns:
        if col.lower() in ['url', 'urls', 'link', 'links']:
            url_column = col
            break
    
    if url_column is None:
        print(f"⚠️  Could not find URL column in {os.path.basename(selected_input_file)}")
        print(f"Available columns: {', '.join(urls_df.columns)}")
        sys.exit(1)
    
    target_urls = urls_df[url_column].dropna().tolist()
    
    # Extract unique domains from target URLs
    target_domains = set()
    for url in target_urls:
        parsed = urlparse(str(url))
        domain = parsed.netloc.lower()
        if domain:
            target_domains.add(domain)
    
    print(f"\n✓ Loaded {len(target_urls)} URL(s) from {os.path.basename(selected_input_file)}")
    print(f"\nURLs to analyze:")
    for i, url in enumerate(target_urls[:10], 1):  # Show first 10
        print(f"  {i}. {url}")
    if len(target_urls) > 10:
        print(f"  ... and {len(target_urls) - 10} more URLs")
    
    print(f"\nDomains extracted: {sorted(target_domains)}")
    
except Exception as e:
    print(f"⚠️  Error reading file: {str(e)}")
    sys.exit(1)

print("\n" + "=" * 80)
print(f"ANALYZING URLs FROM {os.path.basename(selected_input_file)}")
print("=" * 80)

print(f"\nUsing {len(target_urls)} URL(s) from {os.path.basename(selected_input_file)}:")

for i, url in enumerate(sorted(target_urls)[:20], 1):  # Show first 20
    print(f"  {i}. {url}")
if len(target_urls) > 20:
    print(f"  ... and {len(target_urls) - 20} more URLs")

print(f"\nTarget domains for matching: {sorted(target_domains)}")

print("\n" + "=" * 80)
print("COLUMN DEFINITIONS")
print("=" * 80)
print(f"  • selected_url_cited? = Y if exact URL from {os.path.basename(selected_input_file)} is cited")
print("  • any_url_from_domain = Y if ANY URL from same domain is cited")
print(f"                          (includes URLs from {os.path.basename(selected_input_file)})")
print("  • any_url_from_domain_excluding_specified_URLs = Y if ANY other URL from same domain is cited")
print(f"                          (excludes URLs from {os.path.basename(selected_input_file)})")

# List to store all dataframes
all_dfs = []

print("\nProcessing files:")
print("-" * 80)

# Process each file
for file_path in sorted(excel_files):
    filename = os.path.basename(file_path)
    
    # Extract week and platform from filename
    week = extract_week_from_filename(filename)
    platform = extract_platform_from_filename(filename)
    
    if not week:
        print(f"⚠️  Skipping {filename}: Could not extract week")
        continue
    
    # Convert 'all' platform to 'ChatGPT-Paid'
    if platform == 'all':
        platform = 'ChatGPT-Paid'
    
    try:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        # Add week column
        df['week'] = week
        
        # Add platform column
        df['platform'] = platform
        
        # Add selected_url_cited? column
        if 'Sources' in df.columns:
            df['selected_url_cited?'] = df['Sources'].apply(
                lambda x: check_url_cited(x, target_urls)
            )
            # Add any_url_from_domain column (includes ALL domain URLs)
            df['any_url_from_domain'] = df['Sources'].apply(
                lambda x: check_any_domain_url_cited(x, target_domains)
            )
            # Add any_url_from_domain_excluding_specified_URLs column (excludes URLs from urls.csv)
            df['any_url_from_domain_excluding_specified_URLs'] = df['Sources'].apply(
                lambda x: check_domain_cited_excluding_specified(x, target_domains, target_urls)
            )
        else:
            print(f"⚠️  Warning: {filename} does not have 'Sources' column")
            df['selected_url_cited?'] = 'N'
            df['any_url_from_domain'] = 'N'
            df['any_url_from_domain_excluding_specified_URLs'] = 'N'
        
        # Count citations
        citations_count = (df['selected_url_cited?'] == 'Y').sum()
        any_domain_citations_count = (df['any_url_from_domain'] == 'Y').sum()
        other_domain_citations_count = (df['any_url_from_domain_excluding_specified_URLs'] == 'Y').sum()
        
        all_dfs.append(df)
        
        print(f"✓ {filename}")
        print(f"    Week: {week}, Platform: {platform}, Rows: {len(df)}")
        print(f"    Selected URL Citations: {citations_count}, Any Domain URLs: {any_domain_citations_count}, Other Domain URLs: {other_domain_citations_count}")
        
    except Exception as e:
        print(f"✗ Error processing {filename}: {str(e)}")

# Combine all dataframes
if all_dfs:
    print("\n" + "=" * 80)
    print("COMBINING ALL DATA")
    print("=" * 80)
    
    combined_df = pd.concat(all_dfs, ignore_index=True)
    
    # Cleanse Execution Date column
    if 'Execution Date' in combined_df.columns:
        print("\nCleansing Execution Date column...")
        # Convert to datetime, handling various formats
        combined_df['Execution Date'] = pd.to_datetime(
            combined_df['Execution Date'], 
            errors='coerce'  # Invalid dates become NaT
        )
        # Format as YYYY-MM-DD for consistency
        combined_df['Execution Date'] = combined_df['Execution Date'].dt.strftime('%Y-%m-%d')
        print(f"✓ Execution Date column cleansed and standardized to YYYY-MM-DD format")
        
        # Show unique execution dates (useful for daily snapshots)
        unique_dates = sorted([d for d in combined_df['Execution Date'].dropna().unique() if d != 'NaT'])
        if len(unique_dates) > 0:
            print(f"  Execution dates in data: {len(unique_dates)} unique dates")
            if len(unique_dates) <= 10:
                for date in unique_dates:
                    print(f"    - {date}")
            else:
                print(f"    - {unique_dates[0]} to {unique_dates[-1]}")
    
    # Remove duplicates where both Prompt AND Answer are identical (within same week/platform)
    print("\nChecking for duplicate Prompt+Answer combinations...")
    original_rows = len(combined_df)
    
    # Check if Answer column exists
    if 'Answer' in combined_df.columns:
        # Remove duplicates where Prompt, Answer, week, and platform are all the same
        duplicates_before = combined_df.duplicated(subset=['Prompt', 'Answer', 'week', 'platform']).sum()
        
        if duplicates_before > 0:
            print(f"⚠️  Found {duplicates_before} rows with duplicate Prompt+Answer (same week/platform)")
            combined_df = combined_df.drop_duplicates(subset=['Prompt', 'Answer', 'week', 'platform'], keep='first')
            rows_removed = original_rows - len(combined_df)
            print(f"✓ Removed {rows_removed} duplicate Prompt+Answer combinations")
            print(f"  (Kept rows where same prompt has different answers)")
        else:
            print("✓ No duplicate Prompt+Answer combinations found")
    else:
        print("⚠️  'Answer' column not found - skipping duplicate check")
    
    print(f"\nTotal rows: {len(combined_df)}")
    print(f"Selected URL citations: {(combined_df['selected_url_cited?'] == 'Y').sum()}")
    print(f"Any domain URL citations: {(combined_df['any_url_from_domain'] == 'Y').sum()}")
    print(f"Other domain URL citations (excluding specified): {(combined_df['any_url_from_domain_excluding_specified_URLs'] == 'Y').sum()}")
    print(f"\nWeeks: {sorted(combined_df['week'].unique())}")
    print(f"Platforms: {sorted(combined_df['platform'].unique())}")
    
    # Show breakdown by week and platform
    print("\n" + "=" * 80)
    print("BREAKDOWN BY WEEK AND PLATFORM")
    print("=" * 80)
    
    breakdown = combined_df.groupby(['week', 'platform']).agg({
        'selected_url_cited?': lambda x: (x == 'Y').sum(),
        'any_url_from_domain': lambda x: (x == 'Y').sum(),
        'any_url_from_domain_excluding_specified_URLs': lambda x: (x == 'Y').sum(),
        'Prompt': 'count'  # Total rows
    }).reset_index()
    breakdown.columns = ['Week', 'Platform', 'Selected_URL_Citations', 'Any_Domain_URLs', 'Other_Domain_URLs', 'Total_prompt_executions']
    breakdown['Selected_URL_Rate_%'] = (breakdown['Selected_URL_Citations'] / breakdown['Total_prompt_executions'] * 100).round(2)
    breakdown['Any_Domain_Rate_%'] = (breakdown['Any_Domain_URLs'] / breakdown['Total_prompt_executions'] * 100).round(2)
    breakdown['Other_Domain_Rate_%'] = (breakdown['Other_Domain_URLs'] / breakdown['Total_prompt_executions'] * 100).round(2)
    
    print(breakdown.to_string(index=False))
    
    # Determine domain name for subfolder
    # Extract domain from the first URL or use filename
    if target_domains:
        domain_name = list(target_domains)[0].replace('www.', '')
    else:
        # Fallback to filename without extension
        domain_name = os.path.splitext(os.path.basename(selected_input_file))[0]
    
    # Clean domain name for folder (remove invalid characters)
    domain_name_clean = re.sub(r'[<>:"/\\|?*]', '_', domain_name)
    
    # Create timestamp for filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Create Output folder structure: Output/domain/
    base_output_folder = 'Output'
    domain_output_folder = os.path.join(base_output_folder, domain_name_clean)
    
    if not os.path.exists(base_output_folder):
        os.makedirs(base_output_folder)
        print(f"\n✓ Created '{base_output_folder}' folder")
    
    if not os.path.exists(domain_output_folder):
        os.makedirs(domain_output_folder)
        print(f"\n✓ Created subfolder: '{domain_name_clean}'")
    
    # Save to Excel with folder name and timestamp in filename
    output_filename = f'brandpresence-full-combined-{selected_folder}_{timestamp}.xlsx'
    output_file = os.path.join(domain_output_folder, output_filename)
    
    # Create a dataframe with the target URLs for reference
    urls_df = pd.DataFrame({'urls': target_urls})
    
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        combined_df.to_excel(writer, sheet_name='combined_data', index=False)
        urls_df.to_excel(writer, sheet_name='target_urls', index=False)
    
    print("\n" + "=" * 80)
    print(f"✓ Data saved to: {output_file}")
    print("=" * 80)
    
    # Show column list
    print("\nColumns in output file:")
    for i, col in enumerate(combined_df.columns, 1):
        print(f"  {i}. {col}")
    
    # Automatically run citation rate calculation
    print("\n" + "=" * 80)
    print("RUNNING CITATION RATE CALCULATION")
    print("=" * 80)
    
    try:
        # Get the path to the Python interpreter
        python_executable = sys.executable
        
        # Run calculate_citation_rates.py with the output file, folder name, output folder, and timestamp
        result = subprocess.run(
            [python_executable, 'calculate_citation_rates.py', output_file, selected_folder, domain_output_folder, timestamp],
            capture_output=True,
            text=True,
            check=True
        )
        
        # Print the output from the calculation script
        print(result.stdout)
        
        if result.stderr:
            print("Warnings/Errors from citation rate calculation:")
            print(result.stderr)
        
        print("\n" + "=" * 80)
        print("✓ Citation rate calculation completed successfully!")
        print("=" * 80)
        
    except subprocess.CalledProcessError as e:
        print(f"\n⚠️  Error running citation rate calculation:")
        print(f"Exit code: {e.returncode}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
    except Exception as e:
        print(f"\n⚠️  Unexpected error running citation rate calculation: {str(e)}")
    
else:
    print("\n⚠️  No data to combine!")

